import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../pages/admin/Admin.css';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="admin-layout">
            {/* Mobile Header */}
            <div className="mobile-header">
                <button className="mobile-menu-btn" onClick={toggleSidebar}>
                    <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
                </button>
                <div className="mobile-logo">
                    <i className="fas fa-shield-alt me-2" style={{ color: '#6366f1' }}></i>
                    Checkscam Admin
                </div>
                <div style={{ width: '40px' }}></div>
            </div>

            {/* Sidebar Overlay */}
            <div 
                className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} 
                onClick={closeSidebar}
            ></div>

            {/* Sidebar */}
            <div className={`admin-sidebar ${sidebarOpen ? 'show' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <div className="admin-sidebar-header fade-in">
                        <div className="admin-logo">
                            <div className="admin-logo-icon pulse-glow float">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <div className="admin-logo-text">
                                <h4 className="gradient-text-animated">Checkscam</h4>
                                <span>Admin Panel</span>
                            </div>
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="admin-user-profile">
                        <div className="admin-user-card hover-lift">
                            <div className="admin-user-avatar morph">
                                {user?.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt={user.fullName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                                    />
                                ) : (
                                    user?.fullName?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="admin-user-info">
                                <h5>{user?.fullName}</h5>
                                <span className={`admin-user-role ${user?.role === 'super-admin' ? 'super-admin pulse' : ''}`}>
                                    <i className={`fas fa-${user?.role === 'super-admin' ? 'crown icon-swing' : 'user-shield'}`}></i>
                                    {user?.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Navigation */}
                    <nav className="admin-nav">
                        <div className="admin-nav-section stagger-item">
                            <div className="admin-nav-label">Menu chính</div>
                            <Link 
                                to="/admin/dashboard" 
                                className={`admin-nav-link ripple ${isActive('/admin/dashboard')}`}
                                onClick={closeSidebar}
                            >
                                <i className="fas fa-chart-line"></i>
                                Dashboard
                            </Link>
                            <Link 
                                to="/admin/users" 
                                className={`admin-nav-link ripple ${isActive('/admin/users')}`}
                                onClick={closeSidebar}
                            >
                                <i className="fas fa-users-cog"></i>
                                Quản lý Admin
                            </Link>
                            <Link 
                                to="/admin/settings" 
                                className={`admin-nav-link ripple ${isActive('/admin/settings')}`}
                                onClick={closeSidebar}
                            >
                                <i className="fas fa-cog icon-spin" style={{ animationDuration: '3s' }}></i>
                                Cài đặt tài khoản
                            </Link>
                        </div>

                        <div className="admin-nav-section stagger-item" style={{ animationDelay: '0.2s' }}>
                            <div className="admin-nav-label">Quản lý nội dung</div>
                            <Link 
                                to="/admin/reports" 
                                className={`admin-nav-link ripple ${isActive('/admin/reports')}`}
                                onClick={closeSidebar}
                            >
                                <i className="fas fa-flag"></i>
                                Báo cáo
                                <span className="admin-nav-badge badge-pulse">Mới</span>
                            </Link>
                            <Link 
                                to="/admin/marketplace" 
                                className={`admin-nav-link ripple ${isActive('/admin/marketplace')}`}
                                onClick={closeSidebar}
                            >
                                <i className="fas fa-store"></i>
                                Chợ Buôn CS
                            </Link>
                            <Link 
                                to="/admin/news" 
                                className={`admin-nav-link ripple ${isActive('/admin/news')}`}
                                onClick={closeSidebar}
                            >
                                <i className="fas fa-newspaper"></i>
                                Tin tức
                            </Link>
                            <Link 
                                to="/admin/banners" 
                                className={`admin-nav-link ripple ${isActive('/admin/banners')}`}
                                onClick={closeSidebar}
                            >
                                <i className="fas fa-image"></i>
                                Banner
                            </Link>
                            <Link 
                                to="/admin/bot-check" 
                                className={`admin-nav-link ripple ${isActive('/admin/bot-check')}`}
                                onClick={closeSidebar}
                            >
                                <i className="fas fa-robot"></i>
                                BOT CHECK
                            </Link>
                        </div>

                        <div className="admin-nav-section stagger-item" style={{ animationDelay: '0.4s' }}>
                            <div className="admin-nav-label">Khác</div>
                            <Link 
                                to="/" 
                                className="admin-nav-link ripple"
                                onClick={closeSidebar}
                            >
                                <i className="fas fa-home"></i>
                                Về trang chủ
                            </Link>
                        </div>
                    </nav>
                </div>
                {/* Đăng xuất luôn ở cuối sidebar */}
                <div style={{ padding: '16px', borderTop: '1px solid #2d2e4a' }}>
                    <button 
                        onClick={() => { handleLogout(); closeSidebar(); }} 
                        className="admin-nav-link ripple"
                        style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        Đăng xuất
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-main fade-in">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
