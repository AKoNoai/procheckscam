import React from 'react';
import Header from '../components/Header';

const About = () => {
    return (
        <div className="about-page">
            <Header />
            
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #FF225C 0%, #FF6B6B 100%)',
                color: 'white',
                padding: '60px 20px',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '15px' }}>
                        <i className="fas fa-shield-alt"></i> Giới Thiệu
                    </h1>
                    <p style={{ fontSize: '18px', opacity: 0.9 }}>
                        Về Checkscam - Nền tảng kiểm tra và tố cáo lừa đảo hàng đầu Việt Nam
                    </p>
                </div>
            </div>

            <div className="container" style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
                {/* About Section */}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    padding: '30px',
                    marginBottom: '30px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <h2 style={{ color: '#FF225C', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-info-circle"></i> Chúng tôi là ai?
                    </h2>
                    <p style={{ lineHeight: 1.8, color: '#555', marginBottom: '15px' }}>
                        <strong>Checkscam</strong> là nền tảng cộng đồng được thành lập với mục tiêu bảo vệ người dùng khỏi các hành vi lừa đảo trực tuyến tại Việt Nam. Chúng tôi cung cấp công cụ kiểm tra và tố cáo các đối tượng lừa đảo, giúp cộng đồng mua bán online an toàn hơn.
                    </p>
                    <p style={{ lineHeight: 1.8, color: '#555' }}>
                        Với cơ sở dữ liệu được cập nhật liên tục từ báo cáo của người dùng, Checkscam giúp bạn tra cứu nhanh chóng thông tin về số điện thoại, số tài khoản ngân hàng, Facebook và các thông tin liên quan đến các đối tượng có dấu hiệu lừa đảo.
                    </p>
                </div>

                {/* Mission */}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    padding: '30px',
                    marginBottom: '30px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <h2 style={{ color: '#FF225C', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-bullseye"></i> Sứ mệnh
                    </h2>
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                            <div style={{ 
                                width: '40px', height: '40px', 
                                background: '#FFE5EC', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <i className="fas fa-search" style={{ color: '#FF225C' }}></i>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '5px', color: '#333' }}>Tra cứu nhanh chóng</h4>
                                <p style={{ color: '#666', margin: 0 }}>Kiểm tra thông tin trước khi giao dịch để tránh bị lừa đảo</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                            <div style={{ 
                                width: '40px', height: '40px', 
                                background: '#FFE5EC', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <i className="fas fa-flag" style={{ color: '#FF225C' }}></i>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '5px', color: '#333' }}>Tố cáo lừa đảo</h4>
                                <p style={{ color: '#666', margin: 0 }}>Giúp cộng đồng cảnh báo về các đối tượng lừa đảo mới</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                            <div style={{ 
                                width: '40px', height: '40px', 
                                background: '#FFE5EC', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <i className="fas fa-users" style={{ color: '#FF225C' }}></i>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '5px', color: '#333' }}>Xây dựng cộng đồng</h4>
                                <p style={{ color: '#666', margin: 0 }}>Tạo môi trường mua bán online an toàn và minh bạch</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    padding: '30px',
                    marginBottom: '30px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <h2 style={{ color: '#FF225C', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fas fa-star"></i> Tính năng nổi bật
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <i className="fas fa-database" style={{ fontSize: '40px', color: '#FF225C', marginBottom: '15px' }}></i>
                            <h4 style={{ marginBottom: '10px' }}>Cơ sở dữ liệu lớn</h4>
                            <p style={{ color: '#666', fontSize: '14px' }}>Hàng nghìn báo cáo được xác minh</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <i className="fas fa-bolt" style={{ fontSize: '40px', color: '#FF225C', marginBottom: '15px' }}></i>
                            <h4 style={{ marginBottom: '10px' }}>Tra cứu tức thì</h4>
                            <p style={{ color: '#666', fontSize: '14px' }}>Kết quả trong vài giây</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <i className="fas fa-shield-alt" style={{ fontSize: '40px', color: '#FF225C', marginBottom: '15px' }}></i>
                            <h4 style={{ marginBottom: '10px' }}>Bảo mật cao</h4>
                            <p style={{ color: '#666', fontSize: '14px' }}>Thông tin được bảo vệ an toàn</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <i className="fas fa-mobile-alt" style={{ fontSize: '40px', color: '#FF225C', marginBottom: '15px' }}></i>
                            <h4 style={{ marginBottom: '10px' }}>Đa nền tảng</h4>
                            <p style={{ color: '#666', fontSize: '14px' }}>Sử dụng trên mọi thiết bị</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #FF225C 0%, #FF6B6B 100%)', 
                    borderRadius: '16px', 
                    padding: '40px',
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <h3 style={{ marginBottom: '15px' }}>Bạn đã bị lừa đảo?</h3>
                    <p style={{ marginBottom: '20px', opacity: 0.9 }}>Hãy tố cáo ngay để cảnh báo cộng đồng!</p>
                    <a 
                        href="/report" 
                        style={{ 
                            display: 'inline-block',
                            background: 'white', 
                            color: '#FF225C', 
                            padding: '12px 30px', 
                            borderRadius: '25px',
                            fontWeight: '600',
                            textDecoration: 'none'
                        }}
                    >
                        <i className="fas fa-flag"></i> Tố cáo ngay
                    </a>
                </div>
            </div>
        </div>
    );
};

export default About;
