import React from 'react';
import Header from '../components/Header';

const Contact = () => {
    // ...existing code...

    return (
        <div className="contact-page">
            <Header />
            
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                padding: '60px 20px',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '15px' }}>
                        <i className="fas fa-envelope"></i> Liên Hệ
                    </h1>
                    <p style={{ fontSize: '18px', opacity: 0.9 }}>
                        Chúng tôi luôn sẵn sàng hỗ trợ bạn
                    </p>
                </div>
            </div>

            <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {/* Contact Info */}
                    <div>
                        <div style={{ 
                            background: 'white', 
                            borderRadius: '16px', 
                            padding: '30px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ marginBottom: '25px', color: '#333' }}>Thông tin liên hệ</h3>
                            
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: '#e8f5e9',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-envelope" style={{ color: '#4CAF50', fontSize: '20px' }}></i>
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '5px', color: '#333' }}>Email</h4>
                                    <p style={{ color: '#666', margin: 0 }}>support@checkscam.vn</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: '#e8f5e9',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-phone" style={{ color: '#4CAF50', fontSize: '20px' }}></i>
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '5px', color: '#333' }}>Hotline</h4>
                                    <p style={{ color: '#666', margin: 0 }}>1900 xxxx xx</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: '#e8f5e9',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <i className="fab fa-facebook" style={{ color: '#4CAF50', fontSize: '20px' }}></i>
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '5px', color: '#333' }}>Facebook</h4>
                                    <p style={{ color: '#666', margin: 0 }}>fb.com/checkscam.vn</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: '#e8f5e9',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-clock" style={{ color: '#4CAF50', fontSize: '20px' }}></i>
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '5px', color: '#333' }}>Giờ làm việc</h4>
                                    <p style={{ color: '#666', margin: 0 }}>8:00 - 22:00 (Hàng ngày)</p>
                                </div>
                            </div>
                        </div>

                        {/* FAQ */}
                        <div style={{ 
                            background: 'white', 
                            borderRadius: '16px', 
                            padding: '30px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }}>
                            <h3 style={{ marginBottom: '20px', color: '#333' }}>Câu hỏi thường gặp</h3>
                            <div style={{ marginBottom: '15px' }}>
                                <h5 style={{ color: '#4CAF50', marginBottom: '5px' }}>Làm sao để tố cáo lừa đảo?</h5>
                                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Nhấn nút "Tố cáo scam" và điền thông tin đầy đủ.</p>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <h5 style={{ color: '#4CAF50', marginBottom: '5px' }}>Báo cáo bao lâu được duyệt?</h5>
                                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Thông thường từ 1-3 ngày làm việc.</p>
                            </div>
                            <div>
                                <h5 style={{ color: '#4CAF50', marginBottom: '5px' }}>Thông tin tố cáo có được bảo mật?</h5>
                                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Có, chúng tôi bảo mật tuyệt đối thông tin người tố cáo.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;
