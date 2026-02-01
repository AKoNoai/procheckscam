import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/profiles/${id}`);
        setProfile(response.data.data);
        setError(null);
      } catch (err) {
        setError('Không thể tải thông tin hồ sơ');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // (removed unused fetchProfile)

  if (loading) {
    return (
      <div className="section-gap section-profile">
        <div className="container">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="section-gap section-profile">
        <div className="container">
          <div className="text-center text-danger">{error || 'Không tìm thấy thông tin'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-gap section-profile">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-12 col-lg-10">
            <div className="profile-inner">
              <div className="profile-avatar">
                <img src={profile.avatar || '/assets/images/avt.jpg'} alt={profile.name} />
              </div>
              <div className="profile-title">
                {profile.name}
                {profile.isVerified && (
                  <i 
                    data-visualcompletion="css-img" 
                    aria-label="Tài khoản đã xác minh" 
                    role="img" 
                    style={{
                      backgroundImage: 'url("https://static.xx.fbcdn.net/rsrc.php/v3/yf/r/AOac759jBKZ.png")',
                      backgroundPosition: '-168px -153px',
                      backgroundSize: 'auto',
                      width: '16px',
                      height: '16px',
                      backgroundRepeat: 'no-repeat',
                      display: 'inline-block'
                    }}
                  ></i>
                )}
              </div>

              <div className="profile-buttons">
                <a href={profile.contactInfo?.messenger || `/search?type=messenger&q=${profile.contactInfo?.facebook?.id}`} className="btn-theme btn-theme_primary" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook-messenger"></i>
                  Check Mess
                  <span></span>
                </a>
                <a href={profile.contactInfo?.bot || `/search?type=phone&q=${profile.contactInfo?.phone}`} className="btn-theme btn-theme_primary" target="_blank" rel="noopener noreferrer">
                  <i className="fas fa-robot"></i>
                  Bot Check GDV
                  <span></span>
                </a>
              </div>

              <div className="profile-boxs">
                <div className="row row-col-15">
                  <div className="col-md-6">
                    <div className="profile-box">
                      <div className="profile-box_content">
                        <div className="profile-box_content__title">
                          Thông tin liên hệ
                        </div>
                        <div className="profile-box_content__list">
                          <p>
                            <span><i className="fab fa-facebook-f"></i></span>
                            Fb (chính):
                            {(() => {
                              const href = profile.contactInfo.facebook?.primaryLink || profile.contactInfo.facebook?.link;
                              const label = profile.contactInfo.facebook?.primaryId || profile.contactInfo.facebook?.id || '---';
                              if (href && href !== '#') {
                                return <a href={href}>{label}</a>;
                              } else {
                                return <span className="text-muted">{label}</span>;
                              }
                            })()}
                          </p>
                          <p>
                            <span><i className="fab fa-facebook-f"></i></span>
                            Fb (phụ):
                            {(() => {
                              const sec = profile.contactInfo?.facebook?.secondary || profile.contactInfo?.facebook?.secondaryId || profile.contactInfo?.facebook?.secondaryLink || profile.contactInfo?.facebook?.secondaryUrl || '';
                              const s = sec ? String(sec).trim() : '';
                              if (!s) return <span className="text-muted"> ---</span>;
                              const href = !/^https?:\/\//i.test(s) && !/facebook\.com/i.test(s) ? `https://facebook.com/${encodeURIComponent(s)}` : (!/^https?:\/\//i.test(s) ? `https://${s}` : s);
                              return href && href !== '#' ? (
                                <a href={href} target="_blank" rel="noopener noreferrer">{s}</a>
                              ) : (
                                <span className="text-muted">{s}</span>
                              );
                            })()}
                          </p>
                          {profile.contactInfo?.zalo && (
                            <p>
                              <span><img src="/assets/images/zalo.webp" alt="Zalo" /></span>
                              Check Zalo:
                              {profile.contactInfo.zalo ? (
                                /^https?:\/\//i.test(profile.contactInfo.zalo)
                                  ? <a href={profile.contactInfo.zalo} target="_blank" rel="noopener noreferrer">{profile.contactInfo.zalo}</a>
                                  : <span className="text-muted">{profile.contactInfo.zalo}</span>
                              ) : (
                                <span className="text-muted">---</span>
                              )}
                            </p>
                          )}
                          {profile.contactInfo?.website && (
                            <p>
                              <span><i className="far fa-globe"></i></span>
                              Website:
                              <a href={profile.contactInfo.website} target="_blank" rel="noopener noreferrer">
                                {profile.contactInfo.website}
                              </a>
                            </p>
                          )}
                        </div>
                        <div className="profile-box_content__image">
                          <img src="/assets/images/info.webp" alt="Info" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="profile-box">
                      <div className="profile-box_content">
                        <div className="profile-box_content__title">
                          Quỹ Bảo Hiểm Checkscam
                        </div>
                        <div className="profile-box_content__desc">
                          <p>
                            Khách hàng sẽ được <b>Checkscam bảo hiểm an toàn giao dịch</b> với số
                            tiền trong quỹ bảo hiểm <strong>{profile.insuranceFund?.toLocaleString('vi-VN')} vnđ</strong> của <strong>{profile.name}</strong>
                          </p>
                        </div>
                        <div className="profile-box_content__image">
                          <img src="/assets/images/shield.webp" alt="Shield" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-boxs">
                <div className="profile-box profile-box_nopr">
                  <div className="profile-box_content">
                    <div className="profile-box_content__title">
                      Vui lòng kiểm tra kỹ thông tin trước khi giao dịch tránh Fake:
                    </div>
                    <div className="profile-box_content__subtitle">
                      Chủ TK "{profile.name}"
                    </div>
                    <ul className="pl-3 mb-0">
                      {profile.bankAccounts?.map((bank, index) => (
                        <li key={index}>
                          <strong>{bank.bankName}:</strong> {bank.accountNumber}
                        </li>
                      ))}
                    </ul>
                    <div className="profile-box_content__desc">
                      <p>
                        <strong>Lưu Ý:</strong> Tránh trường hợp Nick Fake, Ảnh Fake, Link Fake, Rửa
                        Tiền…. Người dùng hãy nhớ Chát đúng Facebook, Gọi đúng SĐT, Chuyển khoản
                        đúng những STK có ở trong trong link bảo hiểm này Checkscam cam kết bạn sẽ
                        an toàn trong mọi giao dịch..!!!
                      </p>
                    </div>
                    <div className="profile-box_content_watermark">
                      <img src="/assets/images/xacnhanuytin.svg" alt="Verified" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-desc">
                Mọi giao dịch của bạn với <b>"{profile.name}"</b> sẽ được <b>Check Scam Bảo vệ</b> với số tiền nằm trong <strong>Quỹ bảo hiểm {profile.insuranceFund?.toLocaleString('vi-VN')} vnđ</strong> khi bạn tuân theo
                <a href="/terms"> Điều Khoản Sử Dụng</a> của Check Scam
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
