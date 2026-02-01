
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

const STATUS_LABEL = {
  pending: 'Chờ duyệt',
  verified: 'Đã duyệt',
  rejected: 'Từ chối'
};

const STATUS_BADGE = {
  pending: 'warning',
  verified: 'success',
  rejected: 'danger'
};

const Reports = () => {
  const [viewing, setViewing] = useState(null); // Báo cáo đang xem
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const status = useMemo(() => searchParams.get('status') || '', [searchParams]);

  const fetchReports = async (nextPage = 1, nextStatus = status) => {
    try {
      setLoading(true);
      const qs = new URLSearchParams();
      qs.set('page', String(nextPage));
      qs.set('limit', '20');
      if (nextStatus) qs.set('status', nextStatus);

      const res = await api.get(`/reports?${qs.toString()}`);
      setItems(res.data.data || []);
      setPage(res.data.currentPage || nextPage);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      console.error('Fetch reports error:', e);
      alert(e.response?.data?.message || 'Không tải được danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const setStatusFilter = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('status', value);
    else next.delete('status');
    setSearchParams(next);
  };

  const updateStatus = async (id, nextStatus) => {
    if (!window.confirm(`Đổi trạng thái sang "${STATUS_LABEL[nextStatus] || nextStatus}"?`)) return;
    try {
      await api.put(`/reports/${id}/status`, { status: nextStatus });
      await fetchReports(page, status);
    } catch (e) {
      alert(e.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Xóa báo cáo này? Hành động không thể hoàn tác.')) return;
    try {
      setLoading(true);
      await api.delete(`/reports/${id}`);
      await fetchReports(page, status);
    } catch (e) {
      alert(e.response?.data?.message || 'Xóa báo cáo thất bại');
    } finally {
      setLoading(false);
    }
  };

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Báo cáo</h2>
          <button className="btn btn-outline-secondary" onClick={() => fetchReports(page, status)} disabled={loading}>
            Làm mới
          </button>
        </div>

        <div className="card mb-3">
          <div className="card-body d-flex flex-wrap gap-2 align-items-center">
            <div className="fw-bold me-2">Lọc trạng thái:</div>
            <button
              className={`btn btn-sm ${status === '' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setStatusFilter('')}
            >
              Tất cả
            </button>
            {['pending', 'verified', 'rejected'].map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${status === s ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setStatusFilter(s)}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-4">Đang tải...</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-muted">Chưa có báo cáo</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 180 }}>Ngày tạo</th>
                      <th>Đối tượng</th>
                      <th>Liên hệ</th>
                      <th style={{ width: 140 }}>Trạng thái</th>
                      <th style={{ width: 260 }} className="text-end">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <tr key={r._id}>
                        <td>{new Date(r.createdAt).toLocaleString('vi-VN')}</td>
                        <td>
                          <div className="fw-bold">{r.targetName}</div>
                          <div className="text-muted small">Loại: {r.reportType}</div>
                        </td>
                        <td>
                          <div className="small">
                            {r.targetContact?.phone ? <div>📞 {r.targetContact.phone}</div> : null}
                            {r.targetContact?.facebook ? <div>FB: {r.targetContact.facebook}</div> : null}
                            {r.targetContact?.zalo ? <div>Zalo: {r.targetContact.zalo}</div> : null}
                            {r.targetContact?.bankAccount ? <div>STK: {r.targetContact.bankAccount}</div> : null}
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${STATUS_BADGE[r.status] || 'secondary'}`}>
                            {STATUS_LABEL[r.status] || r.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => setViewing(r)}
                              disabled={loading}
                            >
                              Xem
                            </button>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => updateStatus(r._id, 'verified')}
                              disabled={loading || r.status === 'verified'}
                            >
                              Duyệt
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => updateStatus(r._id, 'rejected')}
                              disabled={loading || r.status === 'rejected'}
                            >
                              Từ chối
                            </button>
                            <button
                              className="btn btn-sm btn-outline-dark"
                              onClick={() => deleteReport(r._id)}
                              disabled={loading}
                            >
                              Xóa
                            </button>
                          </div>
                              {/* Modal xem chi tiết báo cáo */}
                              {viewing && (
                                <div className="modal show fade d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                  <div className="modal-dialog modal-lg">
                                    <div className="modal-content">
                                      <div className="modal-header">
                                        <h5 className="modal-title">Chi tiết báo cáo</h5>
                                        <button type="button" className="btn-close" onClick={() => setViewing(null)}></button>
                                      </div>
                                      <div className="modal-body">
                                        <div><b>Ngày tạo:</b> {new Date(viewing.createdAt).toLocaleString('vi-VN')}</div>
                                        <div><b>Đối tượng:</b> {viewing.targetName}</div>
                                        <div><b>Loại:</b> {viewing.reportType}</div>
                                        <div><b>Liên hệ:</b>
                                          <div className="small">
                                            {viewing.targetContact?.phone ? <div>📞 {viewing.targetContact.phone}</div> : null}
                                            {viewing.targetContact?.facebook ? <div>FB: {viewing.targetContact.facebook}</div> : null}
                                            {viewing.targetContact?.zalo ? <div>Zalo: {viewing.targetContact.zalo}</div> : null}
                                            {viewing.targetContact?.bankAccount ? <div>STK: {viewing.targetContact.bankAccount}</div> : null}
                                          </div>
                                        </div>
                                        <div><b>Nội dung báo cáo:</b></div>
                                        <div className="border rounded p-2 bg-light mb-2">{viewing.content || <i>Không có</i>}</div>
                                        <div><b>Trạng thái:</b> <span className={`badge bg-${STATUS_BADGE[viewing.status] || 'secondary'}`}>{STATUS_LABEL[viewing.status] || viewing.status}</span></div>
                                        {(Array.isArray(viewing.evidence) && viewing.evidence.length > 0) || (Array.isArray(viewing.images) && viewing.images.length > 0) ? (
                                          <div className="mt-2">
                                            <b>Ảnh đính kèm:</b>
                                            <div className="d-flex flex-wrap gap-2 mt-1">
                                              {(viewing.evidence || viewing.images || []).map((img, idx) => (
                                                <img key={idx} src={img} alt="img" style={{ maxHeight: 120, borderRadius: 4, border: '1px solid #ccc' }} />
                                              ))}
                                            </div>
                                          </div>
                                        ) : null}
                                      </div>
                                      <div className="modal-footer">
                                        <button className="btn btn-secondary" onClick={() => setViewing(null)}>Đóng</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card-footer d-flex justify-content-between align-items-center">
            <div className="text-muted">
              Trang {page}/{totalPages}
            </div>
            <div className="btn-group">
              <button
                className="btn btn-outline-primary"
                disabled={!canPrev || loading}
                onClick={() => fetchReports(page - 1, status)}
              >
                ← Trước
              </button>
              <button
                className="btn btn-outline-primary"
                disabled={!canNext || loading}
                onClick={() => fetchReports(page + 1, status)}
              >
                Sau →
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
