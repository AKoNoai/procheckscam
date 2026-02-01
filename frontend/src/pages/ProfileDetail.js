import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import './ProfileDetail.css';

const ProfileDetail = () => {
  const { id } = useParams();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/${id}`);
        setAdmin(response.data.data);
      } catch (error) {
        console.error('Error fetching admin:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDetail();
  }, [id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="text-center py-5">
        <p className="text-danger">Không tìm thấy thông tin admin</p>
      </div>
    );
  }

  return (
    <div className="profile-detail-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-11">
            {/* Profile Card */}
            <div className="profile-card">
              {/* Avatar */}
              <div className="profile-avatar-large">
                {admin.avatar ? (
                  <img src={admin.avatar} alt={admin.fullName} />
                ) : (
                  <div className="avatar-placeholder">
                    {admin.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name */}
              <h2 className="profile-name">{admin.fullName}</h2>
              {admin.nickname && (
                <div className="profile-nickname">({admin.nickname})</div>
              )}

              {/* Action Buttons */}
              <div className="profile-actions">
                {(() => {
                  const messengerHref = admin.contactInfo?.messenger || (admin.contactInfo?.facebook?.id ? `/search?type=messenger&q=${admin.contactInfo.facebook.id}` : null);
                  return messengerHref ? (
                    <a className="btn btn-primary" href={messengerHref} target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-facebook-messenger me-2"></i>
                      Check Messenger
                    </a>
                  ) : (
                    <button type="button" className="btn btn-primary" disabled>
                      <i className="fab fa-facebook-messenger me-2"></i>
                      Check Messenger
                    </button>
                  );
                })()}

                {(() => {
                  const botHref = admin.contactInfo?.bot || null;
                  return botHref ? (
                    <a className="btn btn-success" href={botHref} target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-telegram-plane me-2"></i>
                      Bot Check GDV
                    </a>
                  ) : (
                    <button type="button" className="btn btn-success" disabled>
                      <i className="fab fa-telegram-plane me-2"></i>
                      Bot Check GDV
                    </button>
                  );
                })()}
              </div>

              {/* Info Boxes */}
              <div className="row g-3 info-boxes-row mt-2">
                {/* Contact Info */}
                <div className="col-lg-6 col-12">
                  <div className="info-box info-box-contact">
                    <h5 className="info-title">Thông Tin Bảo Hiểm:</h5>
                    <div className="info-content info-content-flex">
                      <div className="info-items-left">
                        <div className="info-item">
                          <i className="fab fa-facebook-f"></i>
                          <span>Fb (chính): <a href={admin.contactInfo?.facebook?.primaryLink || admin.contactInfo?.facebook?.link || '#'}>{admin.contactInfo?.facebook?.primaryId || admin.contactInfo?.facebook?.id || admin.username}</a></span>
                        </div>
                        {/* Fb (phụ) - always show, placeholder when empty */}
                        {(() => {
                          const sec = admin.contactInfo?.facebook?.secondary || admin.contactInfo?.facebook?.secondaryId || admin.contactInfo?.facebook?.secondaryLink || admin.contactInfo?.facebook?.secondaryUrl || '';
                          const secStr = sec ? String(sec).trim() : '';
                          let href = '';
                          if (secStr) {
                            if (!/^https?:\/\//i.test(secStr) && !/facebook\.com/i.test(secStr)) {
                              href = `https://facebook.com/${encodeURIComponent(secStr)}`;
                            } else if (!/^https?:\/\//i.test(secStr)) {
                              href = `https://${secStr}`;
                            } else {
                              href = secStr;
                            }
                          }
                          return (
                            <div className="info-item">
                              <i className="fab fa-facebook-f"></i>
                              <span>Fb (phụ): {secStr ? <a href={href} target="_blank" rel="noopener noreferrer">{secStr}</a> : <span className="text-muted">---</span>}</span>
                            </div>
                          );
                        })()} 
                        <div className="info-item">
                          <i className="fas fa-inbox"></i>
                          <span>Inbox Zalo: {admin.contactInfo?.zalo ? <a href={`https://zalo.me/${admin.contactInfo.zalo}`} target="_blank" rel="noopener noreferrer">{admin.contactInfo.zalo}</a> : <span className="text-muted">---</span>}</span>
                        </div>
                        <div className="info-item shop">
                          <i className="fab fa-shopify"></i>
                          <span className="shop-content">
                            <span className="shop-label">Shop trên CS:</span>
                            {admin.contactInfo?.shop ? (
                              (() => {
                                const shop = admin.contactInfo.shop;
                                const href = shop.startsWith('http') || shop.startsWith('/') ? shop : `https://${shop}`;
                                return <a className="shop-link" href={href} target="_blank" rel="noopener noreferrer">{shop}</a>;
                              })()
                            ) : (
                              <span className="shop-empty">---</span>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      {admin.contactInfo?.facebook?.link && (
                        <div className="qr-code-right">
                          <QRCodeSVG 
                            value={admin.contactInfo.facebook.link} 
                            size={100}
                            level="H"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Insurance Fund */}
                <div className="col-lg-6 col-12">
                  <div className="info-box info-box-insurance">
                    <h5 className="info-title">Quỹ Bảo Hiểm CS:</h5>
                    <div className="info-content info-content-flex-insurance">
                      <div className="insurance-text">
                        <p style={{fontSize: '1.05rem', lineHeight: '1.55', fontWeight: 600}}>
                          Từ ngày <strong className="text-danger">{formatDate(admin.insuranceStartDate || admin.createdAt)}</strong> <strong className="guarantee-text">CS sẽ bảo đảm an toàn cho bạn</strong> với số tiền trong Quỹ Bảo Hiểm <strong className="text-danger">{formatMoney(admin.insuranceFund || 10000000)}.vnđ</strong> của <strong className="profile-fullname-inline">{admin.fullName}</strong>
                        </p>
                      </div>
                      <div className="insurance-icon-right">
                        <i className="fas fa-lock"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Box */}
              <div className="services-box mt-4">
                <h5 className="services-title">Dịch vụ cung cấp:</h5>
                <div className="services-content">
                  {admin.services && admin.services.length > 0 ? (
                    <ul className="services-list">
                      {admin.services.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="services-list">
                      <li>Dịch vụ Social Media, Facebook, Youtube, Shopee, Twitter, Google, TikTok, Instagram, Telegram...ưu tiên số 1 Việt Nam</li>
                      <li>Bảo mật thông tin khách hàng tuyệt đối 100%.</li>
                      <li>Hỗ trợ nhiệt tình, chu đáo 24/24.</li>
                      <li><a href="https://dichvu.baostar.pro/" target="_blank" rel="noopener noreferrer">https://dichvu.baostar.pro/</a></li>
                    </ul>
                  )}

                  <p style={{fontSize: '1.05rem', fontWeight: '700', marginTop: '1rem', marginBottom: '0.5rem'}}>
                    Chủ tK "<strong className="profile-fullname-dark">{admin.fullName}</strong>"
                  </p>
                  
                  {admin.bankAccounts && admin.bankAccounts.length > 0 && (
                    <ul className="services-list">
                      {admin.bankAccounts.map((bank, index) => (
                        <li key={index}>{bank.bankName}: {bank.accountNumber}</li>
                      ))}
                    </ul>
                  )}

                  <div className="stamp-checkscam" aria-hidden="true">
                    <i className="fas fa-lock stamp-lock"></i>
                    <div className="stamp-text">
                      <div className="stamp-text-top">QUỸ BẢO HIỂM MMO</div>
                      <div className="stamp-text-main">CHECKSCAM.VN</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Global warning under the services box */}
              <div className="global-warning mt-2">
                <span className="warning-head">
                  <i className="fas fa-exclamation-triangle"></i>
                  <strong>LƯU Ý:</strong>
                </span>
                <span className="warning-text">Hãy luôn tuân thủ <button type="button" className="warning-link">Nội Quy Giao Dịch</button>. Và phải sử dụng Bot <button type="button" className="warning-link">Discord</button> & <button type="button" className="warning-link">Telegram</button> để check khi giao dịch ...!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
