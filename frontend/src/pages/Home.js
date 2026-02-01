import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getBotCheckLinks } from '../utils/botCheckLinks';
import './Home.css';
import Banner from '../components/Banner';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalProfiles: 0,
    totalReports: 0,
    pendingReports: 0,
    totalComments: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [showAllReports, setShowAllReports] = useState(false);
  // const [totalReportsToday, setTotalReportsToday] = useState(0); // Đã bỏ vì không dùng
  const [recentComments, setRecentComments] = useState([]);
  const [topScammers, setTopScammers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [botLink, setBotLink] = useState('');
    useEffect(() => {
      const arr = getBotCheckLinks();
      setBotLink(arr.length > 0 ? arr[0].url : '');
    }, []);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchData không đổi nên an toàn

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, recentRes, , recentCommentsRes] = await Promise.all([
        api.get('/reports/stats'),
        api.get('/reports/public?limit=10'),
        api.get('/users'),
        api.get('/comments/recent?limit=10')
      ]);

      // Đã bỏ biến adminsOnly vì không dùng

      setStats({
        totalProfiles: statsRes.data.data?.bankScamCount || 0,
        totalReports: statsRes.data.data?.fbScamCount || 0,
        pendingReports: statsRes.data.data?.pending || 0,
        totalComments: statsRes.data.data?.comments || 0
      });

      // Sort reports so newest are first
      const reports = recentRes.data.data || [];
      reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentReports(reports);
      // Đã xóa setTotalReportsToday vì không dùng
      setRecentComments(recentCommentsRes.data.data || []);
      
      // Get reports from last 7 days
      const last7DaysRes = await api.get('/reports/last7days?limit=10');
      setTopScammers(last7DaysRes.data.data || []);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Nếu bị 401 thì chuyển hướng sang trang đăng nhập admin
        navigate('/admin/login');
      } else {
        console.error('Error fetching data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="home-page">
      {/* Hero Section - flush to header, full width, styled as screenshot */}
      <div className="hero-section-scam bg-white pt-4 pb-4" style={{ borderBottom: '1px solid #eee', marginBottom: 0 }}>
        <div className="container-fluid px-0">
          <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ minHeight: '340px' }}>
            {/* Lock Icon */}
            <div className="mb-2">
              <i className="fas fa-lock" style={{ fontSize: '70px', color: '#FF225C' }}></i>
            </div>
            {/* Title */}
            <h1 className="fw-bold mb-2" style={{ color: '#FF225C', fontSize: '2.5rem', letterSpacing: '-1px', textAlign: 'center', textShadow: '0 2px 8px #fff', fontFamily: 'Times New Roman', fontStyle: 'normal' }}>
              KIỂM TRA & TỐ CÁO SCAM
            </h1>
            {/* Stats */}
            <div className="mb-2" style={{ fontSize: '1.2rem', textAlign: 'center', fontWeight: 500 }}>
              Hiện có <span style={{ color: '#FF225C', fontWeight: 700 }}>{stats.totalProfiles.toLocaleString()} stk, sđt</span> &
              <span style={{ color: '#FF225C', fontWeight: 700 }}> {stats.totalReports.toLocaleString()} fb</span> lừa đảo,
              <span style={{ color: '#FF225C', fontWeight: 700 }}> {stats.totalComments.toLocaleString()}</span> bình luận,
              <span style={{ color: '#FF225C', fontWeight: 700 }}> {stats.pendingReports.toLocaleString()}</span> cảnh báo đang chờ duyệt
            </div>
            <div className="mb-2" style={{ color: '#222', fontSize: '1.1rem', fontWeight: 400, textAlign: 'center' }}>
              Sẽ giúp bạn mua bán an toàn hơn khi online !!!
            </div>
            {/* Search Box */}
            <form onSubmit={handleSearch} className="w-100" style={{ maxWidth: 700 }}>
              <div className="input-group input-group-lg shadow-sm" style={{ borderRadius: 12, overflow: 'hidden' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập sđt, stk....."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderRadius: 0, fontSize: '1.1rem', padding: '1.1rem 1.5rem' }}
                />
                <button
                  type="submit"
                  className="btn btn-light border px-4"
                  style={{ borderRadius: 0, borderLeft: 'none', color: '#FF225C', fontWeight: 700, fontSize: '1.3rem' }}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
            <div className="mt-2 mb-2" style={{ color: '#FF225C', fontWeight: 600, fontSize: '1rem', textAlign: 'center' }}>
              Cài đặt App cảnh báo những trang web lừa đảo tại đây !!!
            </div>
            {/* Action Buttons */}
            <div className="d-flex flex-wrap justify-content-center gap-3 mt-2" style={{ width: '100%', maxWidth: 900 }}>
              <button
                onClick={() => navigate('/report')}
                className="btn btn-danger btn-lg px-4 fw-bold"
                style={{ borderRadius: 10, minWidth: 170 }}
              >
                Tố Cáo Scam
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="btn btn-primary btn-lg px-4 fw-bold"
                style={{ borderRadius: 10, minWidth: 170 }}
              >
                <i className="fas fa-shopping-cart me-2"></i>
                Chợ Buôn CS
              </button>
              <button
                onClick={() => navigate('/insurance')}
                className="btn btn-info btn-lg px-4 fw-bold text-white"
                style={{ borderRadius: 10, minWidth: 170 }}
              >
                Bảo Hiểm CS
              </button>
              <a
                href={botLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark btn-lg px-4 fw-bold"
                style={{ borderRadius: 10, minWidth: 170, pointerEvents: botLink ? 'auto' : 'none', opacity: botLink ? 1 : 0.5 }}
              >
                <i className="fas fa-robot me-2"></i>
                BOT Check
              </a>
            </div>
            {/* Banner quảng cáo */}
            <Banner />
          </div>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="section-gap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Today's Reports */}
              <div className="card mb-4 warnings-table">
                <div className="card-header py-2 text-center">
                  <h5 className="mb-0 warnings-header-title">
                    {new Date().toLocaleDateString('vi-VN')} CÓ {recentReports.length} CẢNH BÁO
                  </h5>
                </div>
                <div className="card-body p-0">
                  {loading ? (
                    <div className="text-center py-5">Đang tải...</div>
                  ) : recentReports.length === 0 ? (
                    <div className="text-center py-5 text-muted">Chưa có báo cáo nào</div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {(showAllReports ? recentReports : recentReports.slice(0,3)).map((report, index) => {
                        // Hiển thị mới nhất ở trên, đánh số giảm dần (tổng - index)
                        const displayIndex = recentReports.length - index;
                        return (
                          <button
                            key={report._id}
                            type="button"
                            className="list-group-item list-group-item-action warnings-row"
                            onClick={() => navigate(`/warning/${report._id}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <i className="fas fa-edit text-primary me-3" style={{ fontSize: '18px' }}></i>
                                <div>
                                  <h6 className="mb-1">
                                    {displayIndex}. {report.channel === 'website' ? (report.targetContact?.website || 'Website') : (report.targetName || '---')}
                                  </h6>
                                </div>
                              </div>
                              <div className="text-end warnings-meta">
                                <small className="text-muted me-3"><i className="far fa-clock text-primary me-1"></i>{formatDate(report.createdAt)}</small>
                                <small className="text-warning"><i className="far fa-eye me-1"></i>{report.views || 0} Lượt xem</small>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {recentReports.length > 3 && !showAllReports && (
                  <div className="card-footer bg-white text-center py-3">
                    <button 
                      onClick={() => setShowAllReports(true)}
                      className="btn btn-outline-danger"
                    >
                      XEM THÊM BÀI CẢNH BÁO HÔM NAY
                    </button>
                  </div>
                )}
              </div>

              {/* Top Scammers - Last 7 Days - Only show if has data */}
              {!loading && topScammers.length > 0 && (
                <div className="card shadow-sm">
                  <div className="card-header bg-white py-3">
                    <h4 className="mb-0 text-center">LỪA ĐẢO PHỔ BIẾN 7 NGÀY GẦN ĐÂY</h4>
                  </div>
                  <div className="card-body p-0">
                    <div className="list-group list-group-flush">
                      {topScammers.slice(0, 3).map((report, index) => (
                        <button
                          key={report._id}
                          type="button"
                          className="list-group-item list-group-item-action"
                          onClick={() => navigate(`/warning/${report._id}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-user-shield text-danger me-3" style={{ fontSize: '24px' }}></i>
                              <div>
                                <h6 className="mb-1">
                                  {index + 1}. {report.channel === 'website' ? (report.targetContact?.website || 'Website') : (report.targetName || '---')}
                                </h6>
                              </div>
                            </div>
                            <div className="text-end">
                              <small className="text-muted d-block">
                                <i className="far fa-clock me-1"></i>
                                {formatDate(report.createdAt)}
                              </small>
                              <small className="text-warning">
                                <i className="far fa-eye me-1"></i>
                                {report.views || 0} Lượt xem
                              </small>
                              <small className="text-muted d-block">
                                <i className="far fa-comment me-1"></i>
                                {report.commentCount || 0} bình luận
                              </small>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Comments */}
              <div className="card mt-4 recent-comments-table">
                <div className="card-header py-2">
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 recent-comments-header-left px-3">Người Dùng MXH</div>
                    <div className="flex-fill text-center recent-comments-header-right">Bình Luận Mới Nhất</div>
                  </div>
                </div>
                <div className="card-body p-0">
                  {loading ? (
                    <div className="text-center py-5">Đang tải...</div>
                  ) : recentComments.length === 0 ? (
                    <div className="text-center py-5 text-muted">Chưa có bình luận</div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {recentComments.map((c) => (
                        <button
                          key={c._id}
                          type="button"
                          className="list-group-item list-group-item-action recent-comment-row"
                          onClick={() => navigate(`/warning/${c.reportId?._id}`)}
                        >
                          <div className="d-flex align-items-center">
                            <div className="d-flex align-items-center recent-comment-left" style={{minWidth: 220}}>
                              <div className="recent-comment-avatar">{(c.nickname || 'U').charAt(0).toUpperCase()}</div>
                              <div className="ms-3 recent-comment-author">{c.nickname}</div>
                            </div>

                            <div className="flex-fill recent-comment-text px-3">
                              <div className="recent-comment-content" style={{ whiteSpace: 'pre-wrap' }}>
                                {c.content}
                              </div>
                            </div>


                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
