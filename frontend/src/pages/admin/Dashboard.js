import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
import './Admin.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalReports: 0,
        totalUsers: 0,
        pendingReports: 0,
        pendingMarketplace: 0,
        totalNews: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentReports, setRecentReports] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchRecentActivity();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [reports, users, marketplaceStats, news] = await Promise.all([
                api.get('/reports?limit=1'),
                api.get('/users?limit=1'),
                api.get('/marketplace/stats'),
                api.get('/news?limit=1')
            ]);

            const pendingReports = await api.get('/reports?status=pending&limit=1');

            setStats({
                totalReports: reports.data.total || 0,
                totalUsers: users.data.total || 0,
                pendingReports: pendingReports.data.total || 0,
                pendingMarketplace: marketplaceStats.data.data?.pending || 0,
                totalNews: news.data.total || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentActivity = async () => {
        try {
            const response = await api.get('/reports?limit=5');
            setRecentReports(response.data.data || []);
        } catch (error) {
            console.error('Error fetching recent activity:', error);
        }
    };

    const getCurrentDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('vi-VN', options);
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };

    return (
        <AdminLayout>
            <div className="dashboard-container">
                {/* Header */}
                <div className="dashboard-header fade-in">
                    <div className="dashboard-title">
                        <div className="dashboard-title-icon float">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <div>
                            <h1 className="gradient-text-animated">Dashboard</h1>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                Tổng quan hệ thống Checkscam
                            </p>
                        </div>
                    </div>
                    <div className="dashboard-date pulse-glow">
                        <i className="far fa-calendar-alt"></i>
                        {getCurrentDate()}
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="quick-stats-row">

                    <Link to="/admin/reports?status=pending" className="quick-stat-item hover-lift stagger-item spotlight">
                        <div className={`quick-stat-icon pending ${stats.pendingReports > 0 ? 'icon-swing' : ''}`}>
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="quick-stat-content">
                            <h4 className="counter-animation">{loading ? '...' : stats.pendingReports}</h4>
                            <p>Chờ duyệt</p>
                        </div>
                    </Link>

                    <Link to="/admin/reports" className="quick-stat-item hover-lift stagger-item spotlight">
                        <div className="quick-stat-icon reports icon-bounce">
                            <i className="fas fa-flag"></i>
                        </div>
                        <div className="quick-stat-content">
                            <h4 className="counter-animation">{loading ? '...' : stats.totalReports}</h4>
                            <p>Tổng Báo cáo</p>
                        </div>
                    </Link>

                    <Link to="/admin/users" className="quick-stat-item hover-lift stagger-item spotlight">
                        <div className="quick-stat-icon users icon-bounce">
                            <i className="fas fa-users-cog"></i>
                        </div>
                        <div className="quick-stat-content">
                            <h4 className="counter-animation">{loading ? '...' : stats.totalUsers}</h4>
                            <p>Quản trị viên</p>
                        </div>
                    </Link>

                    <Link to="/admin/marketplace" className="quick-stat-item hover-lift stagger-item spotlight">
                        <div className={`quick-stat-icon marketplace ${stats.pendingMarketplace > 0 ? 'icon-swing' : 'icon-bounce'}`}>
                            <i className="fas fa-store"></i>
                        </div>
                        <div className="quick-stat-content">
                            <h4 className="counter-animation">{loading ? '...' : stats.pendingMarketplace}</h4>
                            <p>Chợ chờ duyệt</p>
                        </div>
                    </Link>
                </div>

                {/* Stats Cards Grid */}
                <div className="stats-container">

                    <div className="stat-card danger fade-in hover-lift spotlight" style={{ animationDelay: '0.1s' }}>
                        <div className="stat-card-header">
                            <div className={`stat-icon-box ${stats.pendingReports > 0 ? 'pulse' : ''}`}>
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            {stats.pendingReports > 0 && (
                                <div className="stat-trend down pulse">
                                    <i className="fas fa-bell"></i>
                                    Cần xử lý!
                                </div>
                            )}
                        </div>
                        <div className="stat-value">{loading ? '...' : stats.pendingReports}</div>
                        <div className="stat-label">Báo cáo chờ duyệt</div>
                        <div className="stat-footer">
                            <Link to="/admin/reports?status=pending" className="stat-link">
                                Xem ngay <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                    </div>

                    <div className="stat-card warning fade-in hover-lift spotlight" style={{ animationDelay: '0.2s' }}>
                        <div className="stat-card-header">
                            <div className="stat-icon-box morph">
                                <i className="fas fa-flag"></i>
                            </div>
                            <div className="stat-trend up bounce-in" style={{ animationDelay: '0.5s' }}>
                                <i className="fas fa-arrow-up"></i>
                                8%
                            </div>
                        </div>
                        <div className="stat-value counter-animation">{loading ? '...' : stats.totalReports}</div>
                        <div className="stat-label">Tổng số báo cáo</div>
                        <div className="stat-footer">
                            <Link to="/admin/reports" className="stat-link">
                                Xem chi tiết <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                    </div>

                    <div className="stat-card success fade-in hover-lift spotlight" style={{ animationDelay: '0.3s' }}>
                        <div className="stat-card-header">
                            <div className="stat-icon-box morph">
                                <i className="fas fa-users-cog"></i>
                            </div>
                        </div>
                        <div className="stat-value counter-animation">{loading ? '...' : stats.totalUsers}</div>
                        <div className="stat-label">Quản trị viên</div>
                        <div className="stat-footer">
                            <Link to="/admin/users" className="stat-link">
                                Quản lý <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                    </div>

                    <div className="stat-card info fade-in hover-lift spotlight" style={{ animationDelay: '0.4s' }}>
                        <div className="stat-card-header">
                            <div className={`stat-icon-box ${stats.pendingMarketplace > 0 ? 'pulse' : 'morph'}`}>
                                <i className="fas fa-store"></i>
                            </div>
                            {stats.pendingMarketplace > 0 && (
                                <div className="stat-trend down bounce-in badge-pulse">
                                    <i className="fas fa-hourglass-half icon-spin"></i>
                                    Chờ
                                </div>
                            )}
                        </div>
                        <div className="stat-value counter-animation">{loading ? '...' : stats.pendingMarketplace}</div>
                        <div className="stat-label">Chợ Buôn chờ duyệt</div>
                        <div className="stat-footer">
                            <Link to="/admin/marketplace" className="stat-link">
                                Xem chi tiết <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                    </div>

                    <div className="stat-card primary fade-in hover-lift spotlight" style={{ animationDelay: '0.5s' }}>
                        <div className="stat-card-header">
                            <div className="stat-icon-box morph">
                                <i className="fas fa-newspaper"></i>
                            </div>
                        </div>
                        <div className="stat-value counter-animation">{loading ? '...' : stats.totalNews}</div>
                        <div className="stat-label">Bài tin tức</div>
                        <div className="stat-footer">
                            <Link to="/admin/news" className="stat-link">
                                Quản lý <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Analytics Grid */}
                <div className="analytics-grid">
                    {/* Chart Card */}
                    <div className="chart-card fade-in-left hover-glow">
                        <div className="chart-header">
                            <div className="chart-title">
                                <div className="chart-title-icon float">
                                    <i className="fas fa-chart-area"></i>
                                </div>
                                <h3>Thống kê báo cáo</h3>
                            </div>
                            <div className="chart-filter">
                                <button className="chart-filter-btn active btn-click ripple">7 ngày</button>
                                <button className="chart-filter-btn">30 ngày</button>
                                <button className="chart-filter-btn">Năm</button>
                            </div>
                        </div>
                        <div style={{ 
                            height: '300px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderRadius: '12px',
                            color: '#64748b'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <i className="fas fa-chart-bar" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                                <p style={{ margin: 0 }}>Biểu đồ thống kê sẽ hiển thị tại đây</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Card */}
                    <div className="activity-card fade-in-right hover-glow">
                        <div className="chart-header">
                            <div className="chart-title">
                                <div className="chart-title-icon float" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                    <i className="fas fa-history"></i>
                                </div>
                                <h3>Hoạt động gần đây</h3>
                            </div>
                        </div>
                        <ul className="activity-list">
                            {recentReports.length > 0 ? recentReports.map((report, index) => (
                                <li key={report._id || index} className="activity-item stagger-item hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className={`activity-icon ${report.status === 'pending' ? 'report pulse' : 'profile'}`}>
                                        <i className={`fas fa-${report.status === 'pending' ? 'flag' : 'check'}`}></i>
                                    </div>
                                    <div className="activity-content">
                                        <h5>{report.title || 'Báo cáo mới'}</h5>
                                        <p>{report.reporterName || 'Người dùng ẩn danh'}</p>
                                    </div>
                                    <span className="activity-time">
                                        {getTimeAgo(report.createdAt)}
                                    </span>
                                </li>
                            )) : (
                                <li className="activity-item fade-in">
                                    <div className="activity-icon profile float">
                                        <i className="fas fa-info"></i>
                                    </div>
                                    <div className="activity-content">
                                        <h5>Chưa có hoạt động</h5>
                                        <p>Các hoạt động sẽ hiển thị ở đây</p>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="chart-card fade-in hover-glow">
                    <div className="chart-header">
                        <div className="chart-title">
                            <div className="chart-title-icon float" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                                <i className="fas fa-bolt"></i>
                            </div>
                            <h3>Thao tác nhanh</h3>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <Link to="/admin/reports?status=pending" className="admin-btn-primary btn-click ripple hover-lift">
                            <i className="fas fa-check-circle"></i>
                            Duyệt báo cáo
                        </Link>
                        <Link to="/admin/marketplace" className="admin-btn-primary btn-click ripple hover-lift" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                            <i className="fas fa-store"></i>
                            Quản lý Chợ Buôn
                        </Link>
                        <Link to="/admin/news" className="admin-btn-primary btn-click ripple hover-lift" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                            <i className="fas fa-plus"></i>
                            Thêm tin tức
                        </Link>
                        <Link to="/admin/users" className="admin-btn-primary btn-click ripple hover-lift" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                            <i className="fas fa-user-plus"></i>
                            Thêm Admin
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;

