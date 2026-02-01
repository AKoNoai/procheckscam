import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { API_URL } from '../../services/api';
import './NewsManagement.css';

const API_BASE_URL = API_URL.replace(/\/api$/, '');

const NewsManagement = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'Cảnh báo',
        isFeatured: false,
        status: 'published'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('all');

    const fetchNews = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);

            const response = await fetch(`${API_URL}/news?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setNews(data.data);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const fetchStats = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/news/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    useEffect(() => {
        fetchNews();
        fetchStats();
    }, [fetchNews, fetchStats]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            category: 'Cảnh báo',
            isFeatured: false,
            status: 'published'
        });
        setImageFile(null);
        setImagePreview(null);
        setEditingNews(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingNews(item);
        setFormData({
            title: item.title,
            excerpt: item.excerpt || '',
            content: item.content,
            category: item.category,
            isFeatured: item.isFeatured,
            status: item.status
        });
        setImagePreview(item.image ? `${API_BASE_URL}${item.image}` : null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });
            
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const url = editingNews 
                ? `${API_URL}/news/${editingNews._id}`
                : `${API_URL}/news`;
            
            const method = editingNews ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const data = await response.json();
            if (data.success) {
                alert(editingNews ? 'Cập nhật tin tức thành công!' : 'Thêm tin tức thành công!');
                setShowModal(false);
                resetForm();
                fetchNews();
                fetchStats();
            } else {
                alert(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving news:', error);
            alert('Có lỗi xảy ra khi lưu tin tức');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tin tức này?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/news/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                alert('Xóa tin tức thành công!');
                fetchNews();
                fetchStats();
            } else {
                alert(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error deleting news:', error);
            alert('Có lỗi xảy ra khi xóa tin tức');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <div className="news-management">
                <div className="page-header">
                    <h1><i className="fas fa-newspaper"></i> Quản lý Tin tức</h1>
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <i className="fas fa-plus"></i> Thêm tin tức
                    </button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <i className="fas fa-newspaper"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.total}</h3>
                            <p>Tổng tin tức</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon published">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.published}</h3>
                            <p>Đã xuất bản</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon draft">
                            <i className="fas fa-edit"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.draft}</h3>
                            <p>Bản nháp</p>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="filter-bar">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tất cả
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'published' ? 'active' : ''}`}
                        onClick={() => setFilter('published')}
                    >
                        Đã xuất bản
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
                        onClick={() => setFilter('draft')}
                    >
                        Bản nháp
                    </button>
                </div>

                {/* News Table */}
                {loading ? (
                    <div className="loading">
                        <i className="fas fa-spinner fa-spin"></i> Đang tải...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Hình ảnh</th>
                                    <th>Tiêu đề</th>
                                    <th>Danh mục</th>
                                    <th>Trạng thái</th>
                                    <th>Lượt xem</th>
                                    <th>Ngày tạo</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {news.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            Chưa có tin tức nào
                                        </td>
                                    </tr>
                                ) : (
                                    news.map(item => (
                                        <tr key={item._id}>
                                            <td>
                                                {item.image ? (
                                                    <img 
                                                        src={`${API_BASE_URL}${item.image}`} 
                                                        alt={item.title}
                                                        className="news-thumbnail"
                                                    />
                                                ) : (
                                                    <div className="no-image">
                                                        <i className="fas fa-image"></i>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="news-title">
                                                    {item.isFeatured && (
                                                        <span className="featured-badge">
                                                            <i className="fas fa-star"></i>
                                                        </span>
                                                    )}
                                                    {item.title}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="category-badge">{item.category}</span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${item.status}`}>
                                                    {item.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                                                </span>
                                            </td>
                                            <td>{item.views}</td>
                                            <td>{formatDate(item.createdAt)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-icon edit"
                                                        onClick={() => openEditModal(item)}
                                                        title="Sửa"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button 
                                                        className="btn-icon delete"
                                                        onClick={() => handleDelete(item._id)}
                                                        title="Xóa"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingNews ? 'Sửa tin tức' : 'Thêm tin tức mới'}</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Tiêu đề *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nhập tiêu đề tin tức"
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Danh mục</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Cảnh báo">Cảnh báo</option>
                                                <option value="Tin tức">Tin tức</option>
                                                <option value="Hướng dẫn">Hướng dẫn</option>
                                                <option value="Thông báo">Thông báo</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Trạng thái</label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value="published">Xuất bản</option>
                                                <option value="draft">Bản nháp</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Mô tả ngắn</label>
                                        <textarea
                                            name="excerpt"
                                            value={formData.excerpt}
                                            onChange={handleInputChange}
                                            rows="2"
                                            placeholder="Mô tả ngắn về tin tức..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Nội dung *</label>
                                        <textarea
                                            name="content"
                                            value={formData.content}
                                            onChange={handleInputChange}
                                            required
                                            rows="6"
                                            placeholder="Nội dung chi tiết của tin tức..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Hình ảnh</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        {imagePreview && (
                                            <div className="image-preview">
                                                <img src={imagePreview} alt="Preview" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group checkbox-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="isFeatured"
                                                checked={formData.isFeatured}
                                                onChange={handleInputChange}
                                            />
                                            <span>Tin nổi bật</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save"></i> {editingNews ? 'Cập nhật' : 'Thêm mới'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default NewsManagement;
