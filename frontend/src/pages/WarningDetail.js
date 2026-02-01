import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './WarningDetail.css';

const getBackendOrigin = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  return base.replace(/\/api\/?$/, '');
};

const ensureNickname = () => {
  const key = 'checkscam_comment_nickname';
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const animals = ['Mèo', 'Cáo', 'Sói', 'Gấu', 'Hươu', 'Thỏ', 'Cú', 'Hổ', 'Chim', 'Rái cá'];
  const colors = ['Đỏ', 'Xanh', 'Vàng', 'Tím', 'Cam', 'Hồng', 'Đen', 'Trắng'];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const n = Math.floor(1000 + Math.random() * 9000);
  const nick = `${pick(animals)} ${pick(colors)} ${n}`;
  localStorage.setItem(key, nick);
  return nick;
};

const WarningDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [content, setContent] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [lightboxImage, setLightboxImage] = useState(null);

  const uploadsBase = useMemo(() => getBackendOrigin(), []);
  const nickname = useMemo(() => ensureNickname(), []);

  const lastFetchedId = useRef(null);

  useEffect(() => {
    // Prevent duplicate fetches for the same id (React StrictMode may call effects twice)
    if (lastFetchedId.current === id) return;
    lastFetchedId.current = id;

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formatDateTime = (date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const [reportRes, commentRes] = await Promise.all([
        api.get(`/reports/${id}`),
        api.get(`/reports/${id}/comments?limit=30`)
      ]);

      setReport(reportRes.data.data);
      setComments(commentRes.data.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Không tìm thấy cảnh báo hoặc chưa được duyệt.' });
      setReport(null);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập nội dung bình luận.' });
      return;
    }

    try {
      setPosting(true);
      setMessage({ type: '', text: '' });

      const res = await api.post(`/reports/${id}/comments`, {
        nickname,
        content
      });

      setComments((prev) => [res.data.data, ...prev]);
      setContent('');
      setMessage({ type: 'success', text: 'Đã gửi bình luận.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gửi bình luận thất bại.' });
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="warning-detail-page">
        <div className="container">
          <div className="text-center py-5">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="warning-detail-page">
      {message.text && (
        <div className={`page-alert ${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="container">
        <div className="mb-3">
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
        </div>

        {!report ? (
          <div className="text-center py-5 text-muted">Không có dữ liệu</div>
        ) : (
          <div className="warning-card">
            <div className="warning-card-header">
              <h3 className="warning-title">Thông tin cảnh báo</h3>
              <div className="warning-meta">
                <span>🕒 {new Date(report.createdAt).toLocaleDateString('vi-VN')}</span>
                <span>👁 {report.views || 0} lượt xem</span>
                <span>💬 {report.commentCount || comments.length} bình luận</span>
              </div>
            </div>

            <div className="warning-body">
              <div className="warning-grid">
                <div className="warning-info">
                  <div className="warning-info-title">Chi tiết</div>

                  {report.channel === 'bank' ? (
                    <>
                      <div className="warning-info-row">
                        <div className="k">Chủ tài khoản</div>
                        <div className="v">{report.targetName || '---'}</div>
                      </div>
                      <div className="warning-info-row">
                        <div className="k">STK</div>
                        <div className="v">{report.targetContact?.bankAccount || '---'}</div>
                      </div>
                      <div className="warning-info-row">
                        <div className="k">Ngân hàng</div>
                        <div className="v">{report.targetContact?.bankName || '---'}</div>
                      </div>
                      <div className="warning-info-row">
                        <div className="k">Facebook</div>
                        <div className="v">{report.targetContact?.facebook || '---'}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="warning-info-row">
                        <div className="k">Website / Link</div>
                        <div className="v">{report.targetContact?.website || '---'}</div>
                      </div>
                      <div className="warning-info-row">
                        <div className="k">Thể loại</div>
                        <div className="v">{report.category || '---'}</div>
                      </div>
                      <div className="warning-info-row">
                        <div className="k">Email liên hệ</div>
                        <div className="v">{report.reporterEmail || '---'}</div>
                      </div>
                    </>
                  )}

                  <div className="warning-info-row">
                    <div className="k">Nội dung cảnh báo</div>
                    <div className="v">{report.description}</div>
                  </div>

                  <div className="warning-info-row">
                    <div className="k">Ảnh/Bằng chứng</div>
                    <div className="v">
                      {Array.isArray(report.evidence) && report.evidence.length > 0 ? (
                        <div className="warning-evidence">
                          {report.evidence.map((u) => {
                            const src = u.startsWith('http') ? u : `${uploadsBase}${u}`;
                            return (
                              <img
                                key={u}
                                src={src}
                                alt="evidence"
                                onClick={() => setLightboxImage(src)}
                                style={{ cursor: 'pointer' }}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        '---'
                      )}
                    </div>
                  </div>

                  <div className="warning-info-row">
                    <div className="k">Cập nhật</div>
                    <div className="v">{formatDateTime(report.updatedAt || report.createdAt)}</div>
                  </div>
                </div>

                <div className="comment-box">
                  <div className="comment-title">Bình luận</div>

                  <form className="comment-form" onSubmit={submitComment}>
                    <div className="nickname">Biệt danh: <strong>{nickname}</strong></div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Gõ để bình luận..."
                    />
                    <div className="comment-form-actions">
                      <button type="submit" disabled={posting}>
                        {posting ? 'Đang gửi...' : 'Gửi'}
                      </button>
                    </div>
                  </form>

                  {comments.length === 0 ? (
                    <div className="p-3 text-muted">Chưa có bình luận nào.</div>
                  ) : (
                    <ul className="comment-list">
                      {comments.map((c) => (
                        <li key={c._id} className="comment-item">
                          <div className="comment-head">
                            <span className="name">{c.nickname}</span>
                            <span className="time">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="comment-content">{c.content}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setLightboxImage(null)}>
                <i className="fas fa-times"></i>
              </button>
              <img src={lightboxImage} alt="evidence full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarningDetail;
