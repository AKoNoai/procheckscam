import React from 'react';
import Header from '../components/Header';

const Terms = () => {
    return (
        <div className="terms-page">
            <Header />
            
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '60px 20px',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '15px' }}>
                        <i className="fas fa-file-contract"></i> Điều Khoản Sử Dụng
                    </h1>
                    <p style={{ fontSize: '18px', opacity: 0.9 }}>
                        Cập nhật lần cuối: 01/01/2026
                    </p>
                </div>
            </div>

            <div className="container" style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    padding: '40px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '22px' }}>
                            1. Giới thiệu
                        </h2>
                        <p style={{ lineHeight: 1.8, color: '#555' }}>
                            Chào mừng bạn đến với Checkscam. Bằng việc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
                        </p>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '22px' }}>
                            2. Định nghĩa
                        </h2>
                        <ul style={{ lineHeight: 2, color: '#555', paddingLeft: '20px' }}>
                            <li><strong>"Dịch vụ"</strong>: Là nền tảng Checkscam và tất cả các tính năng liên quan</li>
                            <li><strong>"Người dùng"</strong>: Là bất kỳ cá nhân nào truy cập và sử dụng dịch vụ</li>
                            <li><strong>"Báo cáo"</strong>: Là thông tin tố cáo lừa đảo do người dùng gửi lên</li>
                            <li><strong>"Nội dung"</strong>: Là mọi thông tin, hình ảnh, văn bản được đăng tải</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '22px' }}>
                            3. Quyền và nghĩa vụ của người dùng
                        </h2>
                        <h4 style={{ color: '#444', marginBottom: '10px' }}>3.1 Quyền của người dùng:</h4>
                        <ul style={{ lineHeight: 2, color: '#555', paddingLeft: '20px', marginBottom: '15px' }}>
                            <li>Tra cứu thông tin miễn phí</li>
                            <li>Gửi báo cáo tố cáo lừa đảo</li>
                            <li>Bình luận và tương tác với nội dung</li>
                            <li>Sử dụng tính năng Chợ Buôn CS</li>
                        </ul>
                        <h4 style={{ color: '#444', marginBottom: '10px' }}>3.2 Nghĩa vụ của người dùng:</h4>
                        <ul style={{ lineHeight: 2, color: '#555', paddingLeft: '20px' }}>
                            <li>Cung cấp thông tin chính xác và trung thực</li>
                            <li>Không đăng tải nội dung sai sự thật, vu khống</li>
                            <li>Không sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                            <li>Tôn trọng quyền riêng tư của người khác</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '22px' }}>
                            4. Chính sách nội dung
                        </h2>
                        <p style={{ lineHeight: 1.8, color: '#555', marginBottom: '15px' }}>
                            Chúng tôi có quyền xem xét, chỉnh sửa hoặc xóa bất kỳ nội dung nào vi phạm các quy định sau:
                        </p>
                        <ul style={{ lineHeight: 2, color: '#555', paddingLeft: '20px' }}>
                            <li>Nội dung sai sự thật, không có căn cứ</li>
                            <li>Nội dung xúc phạm, phỉ báng cá nhân</li>
                            <li>Nội dung vi phạm pháp luật Việt Nam</li>
                            <li>Spam hoặc quảng cáo không được phép</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '22px' }}>
                            5. Quy trình xác minh báo cáo
                        </h2>
                        <p style={{ lineHeight: 1.8, color: '#555' }}>
                            Tất cả các báo cáo sẽ được Admin xem xét trước khi công khai. Chúng tôi có quyền từ chối các báo cáo không đủ bằng chứng hoặc vi phạm quy định. Thời gian xử lý thông thường từ 1-3 ngày làm việc.
                        </p>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '22px' }}>
                            6. Miễn trừ trách nhiệm
                        </h2>
                        <p style={{ lineHeight: 1.8, color: '#555' }}>
                            Checkscam là nền tảng trung gian, chỉ cung cấp thông tin từ cộng đồng. Chúng tôi không chịu trách nhiệm về tính chính xác tuyệt đối của mọi thông tin. Người dùng nên tự xác minh thêm trước khi đưa ra quyết định.
                        </p>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '22px' }}>
                            7. Bảo mật thông tin
                        </h2>
                        <p style={{ lineHeight: 1.8, color: '#555' }}>
                            Chúng tôi cam kết bảo vệ thông tin cá nhân của người dùng theo quy định pháp luật. Thông tin người tố cáo được bảo mật và không chia sẻ cho bên thứ ba trừ khi có yêu cầu từ cơ quan có thẩm quyền.
                        </p>
                    </section>

                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '22px' }}>
                            8. Thay đổi điều khoản
                        </h2>
                        <p style={{ lineHeight: 1.8, color: '#555' }}>
                            Chúng tôi có quyền cập nhật điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải. Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '22px' }}>
                            9. Liên hệ
                        </h2>
                        <p style={{ lineHeight: 1.8, color: '#555' }}>
                            Nếu có bất kỳ thắc mắc nào về điều khoản sử dụng, vui lòng liên hệ chúng tôi qua email: <a href="mailto:support@checkscam.vn" style={{ color: '#667eea' }}>support@checkscam.vn</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
