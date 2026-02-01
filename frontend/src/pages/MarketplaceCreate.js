import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';
import './MarketplaceCreate.css';

const categories = [
    { value: 'account', label: 'Tài khoản', icon: 'fas fa-user-circle' },
    { value: 'item', label: 'Vật phẩm', icon: 'fas fa-gem' },
    { value: 'service', label: 'Dịch vụ', icon: 'fas fa-hands-helping' },
    { value: 'other', label: 'Khác', icon: 'fas fa-ellipsis-h' }
];

function MarketplaceCreate() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        priceUnit: 'VND',
        category: 'other',
        sellerName: '',
        sellerPhone: '',
        contactPhone: '',
        contactFacebook: '',
        contactMessenger: '',
        contactZalo: '',
        contactTelegram: '',
        contactEmail: ''
    });
    
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [dragging, setDragging] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        addImages(files);
    };

    const addImages = (files) => {
        const validFiles = files.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const maxSize = 5 * 1024 * 1024; // 5MB
            return validTypes.includes(file.type) && file.size <= maxSize;
        });

        if (images.length + validFiles.length > 10) {
            alert('Tối đa 10 hình ảnh');
            return;
        }

        const newImages = [...images, ...validFiles];
        setImages(newImages);

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const files = Array.from(e.dataTransfer.files);
        addImages(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description || !formData.price || !formData.sellerName) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (images.length === 0) {
            alert('Vui lòng thêm ít nhất 1 hình ảnh');
            return;
        }

        setSubmitting(true);

        try {
            const submitData = new FormData();
            
            // Add form fields
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    submitData.append(key, formData[key]);
                }
            });

            // Add images
            images.forEach(image => {
                submitData.append('images', image);
            });

            await api.post('/marketplace', submitData);
            setShowSuccess(true);
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="create-listing-page">
            <Header />
            
            <Link to="/marketplace" className="back-link">
                <i className="fas fa-arrow-left"></i> Quay lại Chợ
            </Link>

            <div className="create-listing-header">
                <h1><i className="fas fa-plus-circle"></i> Đăng tin bán</h1>
                <p>Điền thông tin sản phẩm bạn muốn bán</p>
            </div>

            <form className="create-listing-form" onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="form-section">
                    <h3><i className="fas fa-info-circle"></i> Thông tin cơ bản</h3>
                    
                    <div className="form-group">
                        <label>Tiêu đề <span className="required">*</span></label>
                        <input
                            type="text"
                            name="title"
                            placeholder="VD: Bán acc game đẹp giá rẻ..."
                            value={formData.title}
                            onChange={handleChange}
                            required
                            maxLength={200}
                        />
                    </div>

                    <div className="form-group">
                        <label>Mô tả chi tiết <span className="required">*</span></label>
                        <textarea
                            name="description"
                            placeholder="Mô tả chi tiết sản phẩm, tình trạng, lý do bán..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                            maxLength={5000}
                        />
                    </div>

                    <div className="form-group">
                        <label>Giá bán <span className="required">*</span></label>
                        <div className="price-input">
                            <input
                                type="number"
                                name="price"
                                placeholder="VD: 500000"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                            <select 
                                name="priceUnit" 
                                value={formData.priceUnit}
                                onChange={handleChange}
                            >
                                <option value="VND">VND</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Danh mục</label>
                        <div className="category-options">
                            {categories.map(cat => (
                                <div 
                                    key={cat.value}
                                    className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                                >
                                    <i className={cat.icon}></i>
                                    {cat.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="form-section">
                    <h3><i className="fas fa-images"></i> Hình ảnh <span className="required">*</span></h3>
                    
                    <div 
                        className={`image-upload-area ${dragging ? 'dragging' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <i className="fas fa-cloud-upload-alt"></i>
                        <p>Kéo thả hoặc click để chọn ảnh</p>
                        <p><small>Tối đa 10 ảnh, mỗi ảnh tối đa 5MB</small></p>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            multiple 
                            onChange={handleImageSelect}
                        />
                    </div>

                    {imagePreviews.length > 0 && (
                        <div className="image-previews">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="image-preview">
                                    <img src={preview} alt={`Preview ${index + 1}`} />
                                    <button 
                                        type="button" 
                                        className="remove-btn"
                                        onClick={() => removeImage(index)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Seller Info */}
                <div className="form-section">
                    <h3><i className="fas fa-user"></i> Thông tin người bán</h3>
                    
                    <div className="form-group">
                        <label>Tên người bán <span className="required">*</span></label>
                        <input
                            type="text"
                            name="sellerName"
                            placeholder="Tên hoặc biệt danh của bạn"
                            value={formData.sellerName}
                            onChange={handleChange}
                            required
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input
                            type="tel"
                            name="sellerPhone"
                            placeholder="0912345678"
                            value={formData.sellerPhone}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Contact Info */}
                <div className="form-section">
                    <h3><i className="fas fa-address-book"></i> Liên hệ (hiển thị cho người mua)</h3>
                    
                    <div className="contact-inputs">
                        <div className="contact-input phone">
                            <i className="fas fa-phone"></i>
                            <input
                                type="tel"
                                name="contactPhone"
                                placeholder="Số điện thoại"
                                value={formData.contactPhone}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="contact-input zalo">
                            <i className="fas fa-comment-dots"></i>
                            <input
                                type="text"
                                name="contactZalo"
                                placeholder="Số Zalo"
                                value={formData.contactZalo}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="contact-input facebook">
                            <i className="fab fa-facebook"></i>
                            <input
                                type="text"
                                name="contactFacebook"
                                placeholder="Link Facebook"
                                value={formData.contactFacebook}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="contact-input messenger">
                            <i className="fab fa-facebook-messenger"></i>
                            <input
                                type="text"
                                name="contactMessenger"
                                placeholder="Username Messenger"
                                value={formData.contactMessenger}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="contact-input telegram">
                            <i className="fab fa-telegram"></i>
                            <input
                                type="text"
                                name="contactTelegram"
                                placeholder="Username Telegram"
                                value={formData.contactTelegram}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="contact-input email">
                            <i className="fas fa-envelope"></i>
                            <input
                                type="email"
                                name="contactEmail"
                                placeholder="Email"
                                value={formData.contactEmail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="submit-section">
                    <button type="submit" className="btn-submit" disabled={submitting}>
                        {submitting ? (
                            <><i className="fas fa-spinner fa-spin"></i> Đang đăng...</>
                        ) : (
                            <><i className="fas fa-paper-plane"></i> Đăng tin bán</>
                        )}
                    </button>
                    <p className="form-note">
                        <i className="fas fa-info-circle"></i> Tin đăng sẽ được Admin xem xét và phê duyệt trước khi hiển thị
                    </p>
                </div>
            </form>

            {/* Success Modal */}
            {showSuccess && (
                <div className="success-modal">
                    <div className="success-modal-content">
                        <i className="fas fa-check-circle"></i>
                        <h2>Đăng tin thành công!</h2>
                        <p>Tin đăng của bạn đã được gửi và đang chờ Admin phê duyệt. Bạn sẽ nhận thông báo khi tin được duyệt.</p>
                        <button onClick={() => navigate('/marketplace')}>
                            Quay lại Chợ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MarketplaceCreate;
