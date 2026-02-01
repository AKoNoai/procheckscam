import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import Banner from '../components/Banner';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [scamReports, setScamReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await api.get(`/search?query=${encodeURIComponent(searchQuery)}`);
      setResults(response.data.data || []);
      setScamReports(response.data.scamReports || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setScamReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const getRiskLevelClass = (level) => {
    switch (level) {
      case 'safe': return 'text-success';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      default: return 'text-muted';
    }
  };

  const getRiskLevelText = (level) => {
    switch (level) {
      case 'safe': return 'An toàn';
      case 'warning': return 'Cảnh báo';
      case 'danger': return 'Nguy hiểm';
      default: return 'Chưa xác định';
    }
  };

  return (
    <div className="section-gap">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h2 className="text-center mb-4">Tìm Kiếm Thông Tin</h2>
            
            <form onSubmit={handleSearch} className="mb-4">
              <div className="input-group input-group-lg">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập số điện thoại, Facebook ID, số tài khoản..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                </button>
              </div>
            </form>

            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            )}

            {!loading && searched && (
              <div className="search-results">
                {results.length === 0 && scamReports.length === 0 ? (
                  <div className="alert alert-info text-center">
                    Không tìm thấy kết quả nào phù hợp với "<strong>{query}</strong>"
                  </div>
                ) : (
                  <>
                    {results.length > 0 && (
                      <>
                        <div className="mb-3">
                          Tìm thấy <strong>{results.length}</strong> kết quả hồ sơ
                        </div>
                        {/* Thông tin cảnh báo chi tiết từ Profile */}
                        {results.map((profile) => (
                          <div key={profile._id} className="card mb-4">
                            <div className="card-header bg-danger text-white fw-bold">
                              Thông tin cảnh báo
                            </div>
                            <div className="card-body">
                              <div className="d-flex align-items-start mb-3">
                                <img 
                                  src={profile.avatar || '/assets/images/avt.jpg'} 
                                  alt={profile.name}
                                  className="rounded-circle me-3"
                                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1">
                                  <h5 className="card-title mb-1">
                                    {profile.name}
                                    {profile.isVerified && (
                                      <i className="fas fa-check-circle text-primary ms-1"></i>
                                    )}
                                  </h5>
                                  <p className={`mb-2 ${getRiskLevelClass(profile.riskLevel)}`}>
                                    <strong>{getRiskLevelText(profile.riskLevel)}</strong>
                                  </p>
                                  {profile.contactInfo?.phone && (
                                    <p className="mb-1">
                                      <i className="fas fa-phone me-2"></i>
                                      {profile.contactInfo.phone}
                                    </p>
                                  )}
                                  {profile.contactInfo?.facebook?.id && (
                                    <p className="mb-1">
                                      <i className="fab fa-facebook me-2"></i>
                                      {profile.contactInfo.facebook.id}
                                    </p>
                                  )}
                                  {profile.bankAccounts && profile.bankAccounts.length > 0 && (
                                    <p className="mb-1">
                                      <i className="fas fa-university me-2"></i>
                                      {profile.bankAccounts.map(b => `${b.accountNumber} (${b.bankName})`).join(', ')}
                                    </p>
                                  )}
                                  {profile.reportCount && (
                                    <p className="mb-1">
                                      <i className="fas fa-exclamation-triangle me-2"></i>
                                      {profile.reportCount.negative} báo cáo tiêu cực
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Link 
                                to={`/profile/${profile._id}`} 
                                className="btn btn-sm btn-outline-primary mt-2"
                              >
                                Xem chi tiết
                              </Link>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {/* Thông tin cảnh báo từ các báo cáo scam */}
                    {scamReports.length > 0 && (
                      <>
                        <div className="mb-3">
                          Tìm thấy <strong>{scamReports.length}</strong> cảnh báo liên quan
                        </div>
                        {scamReports.map((r, idx) => (
                          <div key={r._id} className="card mb-4 border-danger">
                            <div className="card-header bg-danger text-white fw-bold">
                              Cảnh báo scam
                            </div>
                            <div className="card-body">
                              <h5 className="card-title mb-1">{r.targetName || '---'}</h5>
                              <p className="mb-1"><b>STK:</b> {r.targetContact?.bankAccount || '---'}</p>
                              <p className="mb-1"><b>Ngân hàng:</b> {r.targetContact?.bankName || '---'}</p>
                              <p className="mb-1"><b>Facebook:</b> {r.targetContact?.facebook || '---'}</p>
                              <p className="mb-1"><b>SĐT:</b> {r.targetContact?.phone || '---'}</p>
                              <p className="mb-1"><b>Mô tả:</b> {r.description || ''}</p>
                              <p className="mb-1"><b>Ngày tố cáo:</b> {r.createdAt ? (new Date(r.createdAt).toLocaleDateString('vi-VN')) : ''}</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <Banner />
      </div>
    </div>
  );
};

export default Search;
