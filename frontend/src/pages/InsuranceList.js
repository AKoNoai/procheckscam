import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './InsuranceList.css';
import Banner from '../components/Banner';
import InsuranceWarningModal from '../components/InsuranceWarningModal';

const categories = [
  'Tất cả', 'GDTG MMO', 'Free Fire', 'Liên Quân', 'Roblox', 'Play Together', 'Game Avatar', 'FC Online', 'Valorant',
  'TFT Mobile', 'LMHT', 'Zing Speed', 'NRO', 'Crossfire Legends', 'Pr Story', 'Nạp game', 'Mua gạch thẻ', 'Dv.Google',
  'Dv.Tiktok', 'Dv.Youtube', 'Dv.Facebook', 'Dv.Wechat', 'Fanpage, group', 'Paypal, payoner...', 'Pubg Mobile', 'Game Pass',
  'Tk Chat GPT - Canva Pro', 'Cày thuê Game', 'Mua bán Crypto', 'Rút ví trả sau', 'Data 4, 5G', 'Thiết kế, Code web',
  'Hosting, vps, domain, Proxy', 'Thanh toán cước, vocher', 'Tk Netflix, YouTube, Spotify...', 'Thẻ playerduo, code steam, tinder...',
  'Chuyển tiền quốc tế', 'Tài khoản, sim số đẹp'
];

const InsuranceList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [showWarning, setShowWarning] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (showWarning) {
      sessionStorage.setItem('insuranceWarningShown', '1');
    }
  }, [showWarning]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      // Lấy danh sách admin với limit lớn để hiển thị đầy đủ
      const response = await api.get('/users?limit=1000');
      // Chỉ hiển thị tài khoản admin thường (bỏ super-admin)
      const adminsOnly = (response.data.data || []).filter(
        (user) => (user.role === 'admin') && (user.role !== 'super-admin') && (user.username !== 'admin')
      );
      setAdmins(adminsOnly);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra admin có phụ trách category/game này hay không
  const adminHasCategory = (admin, category) => {
    const source = (admin.serviceCategories && admin.serviceCategories.length)
      ? admin.serviceCategories
      : admin.services; // fallback dữ liệu cũ nếu chưa khai báo serviceCategories

    if (!source || !Array.isArray(source)) return false;
    const lowerCat = category.toLowerCase();
    return source.some((s) => (s || '').trim().toLowerCase() === lowerCat);
  };

  // Lọc theo tên + category được chọn
  const filteredAdmins = admins
    .filter((admin) =>
      admin.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((admin) =>
      selectedCategory === 'Tất cả' ? true : adminHasCategory(admin, selectedCategory)
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Đếm số admin cho từng category để hiển thị số lượng trên thẻ
  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat === 'Tất cả') {
      acc[cat] = admins.length;
    } else {
      acc[cat] = admins.filter((admin) => adminHasCategory(admin, cat)).length;
    }
    return acc;
  }, {});

  const getAvatarColor = (index) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#FAD7A0'
    ];
    return colors[index % colors.length];
  };

  // Khi rời khỏi trang sẽ xóa marker from-admin
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('fromAdminInsurance');
    };
  }, []);

  // Khi mount, nếu vừa quay lại từ trang admin thì không hiện popup,
  // còn không thì hiển thị popup trên load trang
  useEffect(() => {
    try {
      const fromAdmin = sessionStorage.getItem('fromAdminInsurance') === '1';
      if (fromAdmin) {
        setShowWarning(false);
        sessionStorage.removeItem('fromAdminInsurance');
      } else {
        setShowWarning(true);
      }
    } catch (e) {
      setShowWarning(true);
    }
  }, []);

  const handleCloseWarning = () => {
    setShowWarning(false);
  };

  return (
    <div className="insurance-page">
      <InsuranceWarningModal open={showWarning} onClose={handleCloseWarning} />
      <div className="container py-5">
        {/* Hero Header */}
        <div className="insurance-header text-center mb-4">
          <div className="lock-icon mb-2">
            <i className="fas fa-lock"></i>
          </div>
          <h1 className="title mb-3">QUỸ BẢO HIỂM CS</h1>

          <div className="search-wrap mb-3">
            <div className="search-input">
              <input
                type="text"
                placeholder="Tìm admin theo tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon"><i className="fas fa-search"></i></span>
            </div>
          </div>

          <div className="category-tags mb-3">
            {categories.map((item, idx) => (
              <span
                key={item + idx}
                className={`tag-pill ${selectedCategory === item ? 'active' : ''}`}
                onClick={() => setSelectedCategory(item)}
              >
                {item}
                <span className="tag-count">
                  ({categoryCounts[item] || 0})
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Admin List */}
        <div className="admin-board">
          {/* List Title */}
          <div className="list-header">
            <i className="fas fa-users me-2"></i>
            <span className="fw-semibold">Tìm Admin theo số thứ tự:</span>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : (
            <div className="admin-list-grid">
              {filteredAdmins.map((admin, index) => (
                <div 
                  key={admin._id}
                  className="admin-item"
                  onClick={() => {
                    try { sessionStorage.setItem('fromAdminInsurance', '1'); } catch(e){}
                    navigate(`/admin-profile/${admin._id}`);
                  }}
                >
                  <div className="admin-thumb" style={{ backgroundColor: getAvatarColor(index) }}>
                    {admin.avatar ? (
                      <img src={admin.avatar} alt={admin.fullName} />
                    ) : (
                      <span>{admin.fullName?.charAt(0).toUpperCase() || admin.username?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="admin-label">
                    <span className="admin-idx">{index + 1}. </span>
                    {admin.fullName || admin.username}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredAdmins.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">Không tìm thấy admin nào</p>
            </div>
          )}
        </div>
      </div>
      <Banner />
    </div>
  );
};

export default InsuranceList;
