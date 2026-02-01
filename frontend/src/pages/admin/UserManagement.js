import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Danh sách game/danh mục để gán vai trò cho Admin
const ROLE_CATEGORIES = [
    'Free Fire', 'Liên Quân', 'GDTG MMO', 'Roblox', 'Play Together', 'Game Avatar', 'FC Online', 'Valorant',
    'TFT Mobile', 'LMHT', 'Zing Speed', 'NRO', 'Crossfire Legends', 'Pr Story', 'Nạp game', 'Mua gạch thẻ',
    'Dv.Google', 'Dv.Tiktok', 'Dv.Youtube', 'Dv.Facebook', 'Dv.Wechat', 'Fanpage, group', 'Paypal, payoner...',
    'Pubg Mobile', 'Game Pass', 'Tk Chat GPT - Canva Pro', 'Cày thuê Game', 'Mua bán Crypto', 'Rút ví trả sau',
    'Data 4, 5G', 'Thiết kế, Code web', 'Hosting, vps, domain, Proxy', 'Thanh toán cước, vocher',
    'Tk Netflix, YouTube, Spotify...', 'Thẻ playerduo, code steam, tinder...', 'Chuyển tiền quốc tế',
    'Tài khoản, sim số đẹp'
];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        avatar: '',
        fullName: '',
        role: 'admin',
        isActive: true,
        serviceCategories: [] // các game/danh mục admin này phụ trách
    });
    const [detailFormData, setDetailFormData] = useState({
        fullName: '',
        nickname: '',
        services: '', // newline separated list for editing
        contactInfo: {
            facebook: { primaryId: '', primaryLink: '', secondaryId: '' },
            zalo: '',
            phone: '',
            shop: ''
        },
        bankAccounts: [],
        insuranceFund: 10000000
    });
    const [error, setError] = useState('');
    const { user: currentUser, isSuperAdmin } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                avatar: user.avatar || '',
                fullName: user.fullName,
                role: user.role,
                isActive: user.isActive,
                serviceCategories: user.serviceCategories || []
            });
        } else {
            setEditingUser(null);
            setFormData({
                avatar: '',
                fullName: '',
                role: 'admin',
                isActive: true,
                serviceCategories: []
            });
        }
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setError('');
    };

    const handleOpenDetailModal = (user) => {
        setEditingUser(user);
        setDetailFormData({
            fullName: user.fullName || '',
            nickname: user.nickname || '',
            services: (user.services || []).join('\n'),
            contactInfo: {
                facebook: {
                    primaryId: user.contactInfo?.facebook?.primaryId || user.contactInfo?.facebook?.id || '',
                    primaryLink: user.contactInfo?.facebook?.primaryLink || user.contactInfo?.facebook?.link || '',
                    secondaryId: user.contactInfo?.facebook?.secondaryId || user.contactInfo?.facebook?.secondary || ''
                },
                zalo: user.contactInfo?.zalo || '',
                phone: user.contactInfo?.phone || '',
                shop: user.contactInfo?.shop || ''
            },
            bankAccounts: user.bankAccounts || [],
            insuranceFund: user.insuranceFund || 10000000
        });
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setEditingUser(null);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', file);
        try {
            setUploadingAvatar(true);
            const res = await api.post('/users/upload-avatar', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = res.data.url;
            setFormData(prev => ({ ...prev, avatar: url }));
        } catch (err) {
            alert(err.response?.data?.message || 'Tải avatar thất bại');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleDetailInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child, subchild] = name.split('.');
            if (subchild) {
                setDetailFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: {
                            ...prev[parent][child],
                            [subchild]: value
                        }
                    }
                }));
            } else {
                setDetailFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                }));
            }
        } else {
            setDetailFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleBankAccountChange = (index, field, value) => {
        const newBankAccounts = [...detailFormData.bankAccounts];
        newBankAccounts[index] = {
            ...newBankAccounts[index],
            [field]: value
        };
        setDetailFormData(prev => ({ ...prev, bankAccounts: newBankAccounts }));
    };

    const addBankAccount = () => {
        setDetailFormData(prev => ({
            ...prev,
            // add only bankName and accountNumber — owner removed per request
            bankAccounts: [...prev.bankAccounts, { bankName: '', accountNumber: '' }]
        }));
    };

    const removeBankAccount = (index) => {
        setDetailFormData(prev => ({
            ...prev,
            bankAccounts: prev.bankAccounts.filter((_, i) => i !== index)
        }));
    };

    const handleDetailSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...detailFormData };
            if (typeof payload.services === 'string') {
                payload.services = payload.services.split('\n').map(s => s.trim()).filter(Boolean);
            }

            // Backwards compatibility: map new facebook fields to legacy shape expected by backend
            payload.contactInfo = payload.contactInfo || {};
            payload.contactInfo.facebook = payload.contactInfo.facebook || {};
            // set legacy id/link from primary if provided
            payload.contactInfo.facebook.id = payload.contactInfo.facebook.primaryId || payload.contactInfo.facebook.id || '';
            payload.contactInfo.facebook.link = payload.contactInfo.facebook.primaryLink || payload.contactInfo.facebook.link || '';
            // keep secondary id under 'secondary'
            payload.contactInfo.facebook.secondary = payload.contactInfo.facebook.secondaryId || payload.contactInfo.facebook.secondary || '';

            await api.put(`/users/${editingUser._id}`, payload);
            fetchUsers();
            handleCloseDetailModal();
            alert('Cập nhật thông tin thành công!');
        } catch (error) {
            alert('Có lỗi xảy ra khi cập nhật!');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const toggleServiceCategory = (category) => {
        setFormData((prev) => {
            const current = prev.serviceCategories || [];
            const exists = current.includes(category);
            return {
                ...prev,
                serviceCategories: exists
                    ? current.filter((c) => c !== category)
                    : [...current, category]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // client-side validation
        if (!formData.fullName || !formData.fullName.trim()) {
            setError('Vui lòng nhập họ tên');
            return;
        }

        try {
            const payload = {
                avatar: formData.avatar,
                fullName: formData.fullName,
                role: formData.role,
                isActive: formData.isActive,
                serviceCategories: formData.serviceCategories
            };

            if (editingUser) {
                await api.put(`/users/${editingUser._id}`, payload);
            } else {
                await api.post('/users', payload);
            }
            
            fetchUsers();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            return;
        }

        try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa người dùng');
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await api.patch(`/users/${userId}/toggle-status`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể thay đổi trạng thái');
        }
    };

    return (
        <AdminLayout>
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Quản lý Admin</h2>
                    <button 
                        className="btn btn-primary"
                        onClick={() => handleOpenModal()}
                    >
                        <i className="fas fa-plus me-2"></i>
                        Thêm Admin
                    </button>
                </div>

                {/* Search Box */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="fas fa-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tìm Admin theo họ tên..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button 
                                            className="btn btn-outline-secondary"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">Đang tải...</div>
                ) : (
                    <div className="card">
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th style={{width: '60px'}}>STT</th>
                                            <th>Họ tên</th>
                                            <th>Vai trò</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users
                                            .filter(user => user._id !== currentUser?.id && user._id !== currentUser?._id)
                                            .filter(user => {
                                                if (!searchTerm) return true;
                                                const term = searchTerm.toLowerCase();
                                                return (
                                                    user.fullName?.toLowerCase().includes(term)
                                                );
                                            })
                                            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                            .map((user, index) => (
                                            <tr key={user._id}>
                                                <td>{index + 1}</td>
                                                <td>{user.fullName}</td>
                                                <td>
                                                    <span className={`badge ${user.role === 'super-admin' ? 'bg-danger' : 'bg-primary'}`}>
                                                        {user.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                        {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => handleOpenModal(user)}
                                                        title="Chỉnh sửa tài khoản"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-info me-2"
                                                        onClick={() => handleOpenDetailModal(user)}
                                                        title="Chỉnh sửa thông tin (FB, Zalo, ngân hàng)"
                                                    >
                                                        <i className="fas fa-user-circle"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-warning me-2"
                                                        onClick={() => handleToggleStatus(user._id)}
                                                    >
                                                        <i className={`fas fa-${user.isActive ? 'ban' : 'check'}`}></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(user._id)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editingUser ? 'Chỉnh sửa Admin' : 'Thêm Admin mới'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        {error && (
                                            <div className="alert alert-danger">{error}</div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label">Avatar (link ảnh)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="avatar"
                                                value={formData.avatar}
                                                onChange={handleChange}
                                                placeholder="https://...jpg"
                                            />
                                            <div className="mt-2 d-flex align-items-center gap-2">
                                                <label className="btn btn-outline-secondary mb-0">
                                                    Chọn ảnh từ máy
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="d-none"
                                                        onChange={handleAvatarUpload}
                                                        disabled={uploadingAvatar}
                                                    />
                                                </label>
                                                {uploadingAvatar && <span className="text-muted">Đang tải...</span>}
                                                {formData.avatar && (
                                                    <img
                                                        src={formData.avatar}
                                                        alt="avatar preview"
                                                        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Họ tên *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Vai trò game (tích các game admin này phụ trách)</label>
                                            <div className="role-category-chips">
                                                {ROLE_CATEGORIES.map((cat) => {
                                                    const checked = (formData.serviceCategories || []).includes(cat);
                                                    return (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            className={`role-chip ${checked ? 'role-chip-active' : ''}`}
                                                            onClick={() => toggleServiceCategory(cat)}
                                                        >
                                                            {checked && (
                                                                <span className="role-chip-icon">
                                                                    <i className="fas fa-check"></i>
                                                                </span>
                                                            )}
                                                            <span className="role-chip-label">{cat}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <small className="text-muted d-block mt-1">
                                                Dùng để phân quyền admin theo từng game (Free Fire, Liên Quân, v.v.) và để trang Quỹ Bảo Hiểm đếm/lọc đúng.
                                            </small>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Vai trò</label>
                                            <select
                                                className="form-control"
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                disabled={!isSuperAdmin}
                                            >
                                                <option value="admin">Admin</option>
                                                {isSuperAdmin && (
                                                    <option value="super-admin">Super Admin</option>
                                                )}
                                            </select>
                                        </div>

                                        <div className="mb-3 form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                name="isActive"
                                                checked={formData.isActive}
                                                onChange={handleChange}
                                                id="isActiveCheck"
                                            />
                                            <label className="form-check-label" htmlFor="isActiveCheck">
                                                Kích hoạt tài khoản
                                            </label>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                            Hủy
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            {editingUser ? 'Cập nhật' : 'Thêm mới'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {/* Detail Modal - Chỉnh sửa thông tin FB, Zalo, ngân hàng */}
                {showDetailModal && editingUser && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Chỉnh sửa thông tin: {editingUser.fullName}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={handleCloseDetailModal}></button>
                                </div>
                                <form onSubmit={handleDetailSubmit}>
                                    <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                        <div className="mb-3">
                                            <label className="form-label">Họ và tên</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                name="fullName"
                                                value={detailFormData.fullName}
                                                onChange={handleDetailInputChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Biệt danh (Ví dụ: GDTG VN)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="nickname"
                                                value={detailFormData.nickname}
                                                onChange={handleDetailInputChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Dịch vụ cung cấp (mỗi dòng 1 dịch vụ)</label>
                                            <textarea
                                                className="form-control"
                                                rows={4}
                                                name="services"
                                                value={detailFormData.services}
                                                onChange={handleDetailInputChange}
                                                placeholder={"Dịch vụ 1\nDịch vụ 2\nDịch vụ 3"}
                                            />
                                        </div>

                                        <h6 className="mt-4 mb-3 border-top pt-3">Thông tin liên hệ</h6>
                                        
                                        <div className="mb-3">
                                            <label className="form-label">Fb (chính) - ID</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                name="contactInfo.facebook.primaryId"
                                                value={detailFormData.contactInfo.facebook.primaryId}
                                                onChange={handleDetailInputChange}
                                                placeholder="Facebook ID (vd: 1000...)"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Fb (chính) - Link</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                name="contactInfo.facebook.primaryLink"
                                                value={detailFormData.contactInfo.facebook.primaryLink}
                                                onChange={handleDetailInputChange}
                                                placeholder="https://facebook.com/..."
                                            />
                                            {detailFormData.contactInfo.facebook.primaryLink && (
                                                <div className="mt-3 text-center">
                                                    <small className="text-muted d-block mb-2">Mã QR từ Link Facebook:</small>
                                                    <QRCodeSVG 
                                                        value={detailFormData.contactInfo.facebook.primaryLink} 
                                                        size={100}
                                                        level="H"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Fb (phụ) - ID</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                name="contactInfo.facebook.secondaryId"
                                                value={detailFormData.contactInfo.facebook.secondaryId}
                                                onChange={handleDetailInputChange}
                                                placeholder="Facebook ID phụ"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Zalo</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                name="contactInfo.zalo"
                                                value={detailFormData.contactInfo.zalo}
                                                onChange={handleDetailInputChange}
                                                placeholder="0934567843"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Số điện thoại</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                name="contactInfo.phone"
                                                value={detailFormData.contactInfo.phone}
                                                onChange={handleDetailInputChange}
                                                placeholder="0912345678"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Shop trên CS</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                name="contactInfo.shop"
                                                value={detailFormData.contactInfo.shop}
                                                onChange={handleDetailInputChange}
                                                placeholder="Tên/đường dẫn shop trên Checkscam"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Link Messenger</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                name="contactInfo.messenger"
                                                value={detailFormData.contactInfo.messenger}
                                                onChange={handleDetailInputChange}
                                                placeholder="https://m.me/username hoặc link messenger"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Link Bot Check (Bot GDV)</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                name="contactInfo.bot"
                                                value={detailFormData.contactInfo.bot}
                                                onChange={handleDetailInputChange}
                                                placeholder="https://t.me/your_bot hoặc link bot"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Quỹ bảo hiểm (VNĐ)</label>
                                            <input 
                                                type="number"
                                                className="form-control"
                                                name="insuranceFund"
                                                value={detailFormData.insuranceFund}
                                                onChange={handleDetailInputChange}
                                            />
                                        </div>

                                        <h6 className="mt-4 mb-3 border-top pt-3">Tài khoản ngân hàng</h6>
                                        {detailFormData.bankAccounts.map((bank, index) => (
                                            <div key={index} className="mb-3 p-3 border rounded bg-light">
                                                <div className="row g-2 align-items-center">
                                                    <div className="col-md-6">
                                                        <input 
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="Tên ngân hàng (VD: Vcb)"
                                                            value={bank.bankName}
                                                            onChange={(e) => handleBankAccountChange(index, 'bankName', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-md-5">
                                                        <input 
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="Số tài khoản"
                                                            value={bank.accountNumber}
                                                            onChange={(e) => handleBankAccountChange(index, 'accountNumber', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="col-md-1">
                                                        <button 
                                                            type="button"
                                                            className="btn btn-danger btn-sm w-100"
                                                            onClick={() => removeBankAccount(index)}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={addBankAccount}
                                        >
                                            <i className="fas fa-plus me-2"></i>
                                            Thêm tài khoản ngân hàng
                                        </button>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={handleCloseDetailModal}>
                                            Hủy
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            <i className="fas fa-save me-2"></i>
                                            Lưu thay đổi
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default UserManagement;
