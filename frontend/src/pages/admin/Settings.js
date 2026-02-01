import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import api, { API_URL } from '../../services/api';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentAvatar, setCurrentAvatar] = useState('');

    const API_BASE_URL = API_URL.replace(/\/api$/, '');

    // Profile form
    const [profileData, setProfileData] = useState({
        fullName: '',
        username: '',
        avatar: ''
    });

    // Email form
    const [emailData, setEmailData] = useState({
        currentPassword: '',
        newEmail: '',
        confirmEmail: ''
    });

    // Password form
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || '',
                username: user.username || '',
                avatar: user.avatar || ''
            });
            setCurrentAvatar(user.avatar || '');
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleEmailChange = (e) => {
        setEmailData({ ...emailData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    // Upload avatar
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setUploadingAvatar(true);
            const response = await api.post('/users/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = response.data.url;
            setProfileData(prev => ({ ...prev, avatar: url }));
            setCurrentAvatar(url);
            setMessage({ type: 'success', text: 'Tải ảnh đại diện thành công!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Tải ảnh thất bại' });
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Submit profile
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!profileData.fullName.trim()) {
            setMessage({ type: 'error', text: 'Vui lòng nhập họ tên!' });
            return;
        }

        if (!profileData.username.trim()) {
            setMessage({ type: 'error', text: 'Vui lòng nhập tên đăng nhập!' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName: profileData.fullName,
                    username: profileData.username,
                    avatar: profileData.avatar
                })
            });

            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Cập nhật thông tin thành công! Vui lòng đăng nhập lại.' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật thông tin' });
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (emailData.newEmail !== emailData.confirmEmail) {
            setMessage({ type: 'error', text: 'Email xác nhận không khớp!' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users/update-email`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: emailData.currentPassword,
                    newEmail: emailData.newEmail
                })
            });

            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Cập nhật email thành công!' });
                setEmailData({ currentPassword: '', newEmail: '', confirmEmail: '' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra' });
            }
        } catch (error) {
            console.error('Error updating email:', error);
            setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật email' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users/update-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Cập nhật mật khẩu thành công!' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra' });
            }
        } catch (error) {
            console.error('Error updating password:', error);
            setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật mật khẩu' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="settings-page">
                <h2 className="mb-4">
                    <i className="fas fa-cog me-2"></i>
                    Cài đặt tài khoản
                </h2>

                {/* User Info */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <div 
                                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white me-3"
                                style={{ width: '80px', height: '80px', fontSize: '32px', overflow: 'hidden' }}
                            >
                                {currentAvatar ? (
                                    <img 
                                        src={currentAvatar.startsWith('http') ? currentAvatar : `${API_BASE_URL}${currentAvatar}`} 
                                        alt="Avatar" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    user?.fullName?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <h5 className="mb-1">{user?.fullName}</h5>
                                <p className="text-muted mb-0">@{user?.username}</p>
                                <p className="text-muted mb-1">{user?.email}</p>
                                <small className="badge bg-info">
                                    {user?.role === 'super-admin' ? 'Super Administrator' : 'Administrator'}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible`}>
                        {message.text}
                        <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
                    </div>
                )}

                {/* Tabs */}
                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <i className="fas fa-user me-2"></i>
                            Thông tin
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'email' ? 'active' : ''}`}
                            onClick={() => setActiveTab('email')}
                        >
                            <i className="fas fa-envelope me-2"></i>
                            Đổi Email
                        </button>
                    </li>
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                            onClick={() => setActiveTab('password')}
                        >
                            <i className="fas fa-lock me-2"></i>
                            Đổi Mật khẩu
                        </button>
                    </li>
                </ul>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-user me-2"></i>
                                Thông tin cá nhân
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleProfileSubmit}>
                                {/* Avatar Upload */}
                                <div className="mb-4 text-center">
                                    <label className="form-label d-block">Ảnh đại diện</label>
                                    <div 
                                        className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center text-white mb-3"
                                        style={{ 
                                            width: '120px', 
                                            height: '120px', 
                                            fontSize: '48px',
                                            overflow: 'hidden',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => document.getElementById('avatar-upload').click()}
                                    >
                                        {profileData.avatar ? (
                                            <img 
                                                src={profileData.avatar.startsWith('http') ? profileData.avatar : `${API_BASE_URL}${profileData.avatar}`} 
                                                alt="Avatar" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            user?.fullName?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        id="avatar-upload"
                                        className="d-none"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                    />
                                    <div>
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => document.getElementById('avatar-upload').click()}
                                            disabled={uploadingAvatar}
                                        >
                                            {uploadingAvatar ? (
                                                <span><span className="spinner-border spinner-border-sm me-2"></span>Đang tải...</span>
                                            ) : (
                                                <span><i className="fas fa-upload me-2"></i>Tải ảnh mới</span>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="mb-3">
                                    <label className="form-label">Họ và tên *</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        name="fullName"
                                        value={profileData.fullName}
                                        onChange={handleProfileChange}
                                        required
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>

                                {/* Username */}
                                <div className="mb-3">
                                    <label className="form-label">Tên đăng nhập *</label>
                                    <div className="input-group">
                                        <span className="input-group-text">@</span>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="username"
                                            value={profileData.username}
                                            onChange={handleProfileChange}
                                            required
                                            placeholder="Nhập tên đăng nhập"
                                        />
                                    </div>
                                    <small className="text-muted">Tên đăng nhập sẽ dùng khi đăng nhập vào hệ thống</small>
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? (
                                        <span><span className="spinner-border spinner-border-sm me-2"></span>Đang cập nhật...</span>
                                    ) : (
                                        <span><i className="fas fa-save me-2"></i>Lưu thay đổi</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Email Tab */}
                {activeTab === 'email' && (
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-envelope me-2"></i>
                                Thay đổi Email
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleEmailSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Email hiện tại</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        value={user?.email || ''} 
                                        disabled 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Mật khẩu hiện tại *</label>
                                    <input 
                                        type="password" 
                                        className="form-control"
                                        name="currentPassword"
                                        value={emailData.currentPassword}
                                        onChange={handleEmailChange}
                                        required
                                        placeholder="Nhập mật khẩu hiện tại để xác nhận"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email mới *</label>
                                    <input 
                                        type="email" 
                                        className="form-control"
                                        name="newEmail"
                                        value={emailData.newEmail}
                                        onChange={handleEmailChange}
                                        required
                                        placeholder="Nhập email mới"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Xác nhận Email mới *</label>
                                    <input 
                                        type="email" 
                                        className="form-control"
                                        name="confirmEmail"
                                        value={emailData.confirmEmail}
                                        onChange={handleEmailChange}
                                        required
                                        placeholder="Nhập lại email mới"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Đang cập nhật...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>
                                            Cập nhật Email
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="fas fa-lock me-2"></i>
                                Thay đổi Mật khẩu
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Mật khẩu hiện tại *</label>
                                    <input 
                                        type="password" 
                                        className="form-control"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        placeholder="Nhập mật khẩu hiện tại"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Mật khẩu mới *</label>
                                    <input 
                                        type="password" 
                                        className="form-control"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Xác nhận Mật khẩu mới *</label>
                                    <input 
                                        type="password" 
                                        className="form-control"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Đang cập nhật...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>
                                            Cập nhật Mật khẩu
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Settings;
