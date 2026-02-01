import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [searchQuery, setSearchQuery] = useState('');
  // const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // const handleSearch = (e) => {
  //   e.preventDefault();
  //   if (searchQuery.trim()) {
  //     navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  //   }
  // };

  return (
    <header className="header bg-white position-relative z-index-10" id="header">
      <div className="header-main">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-3">
              <div className="header-bar d-flex align-items-center">
                <div className="header-hamburger d-block d-lg-none" style={{ marginRight: '15px', display: isMenuOpen ? 'none' : 'block' }}>
                  <button 
                    type="button" 
                    className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
                    id="header-hamburger"
                    onClick={toggleMenu}
                    style={{
                      width: '44px',
                      height: '44px',
                      background: '#f1f5f9',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px',
                      borderRadius: '10px',
                      position: 'relative',
                      zIndex: 1002
                    }}
                  >
                    <span style={{
                      display: 'block',
                      width: '22px',
                      height: '3px',
                      background: '#1a1a2e',
                      borderRadius: '2px'
                    }}></span>
                    <span style={{
                      display: 'block',
                      width: '22px',
                      height: '3px',
                      background: '#1a1a2e',
                      borderRadius: '2px'
                    }}></span>
                    <span style={{
                      display: 'block',
                      width: '22px',
                      height: '3px',
                      background: '#1a1a2e',
                      borderRadius: '2px'
                    }}></span>
                  </button>
                </div>
                <div className="header-logo d-flex align-items-center">
                  <Link to="/" className="d-flex align-items-center" style={{ gap: '8px' }}>
                    <img src="/assets/images/logo.svg" alt="Checkscam" />
                    <i className="fas fa-lock lock-icon" title="An toàn"></i>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              {/* Mobile Menu */}
              {isMenuOpen && (
                <div 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '280px',
                    height: '100vh',
                    background: 'white',
                    zIndex: 1001,
                    boxShadow: '2px 0 20px rgba(0,0,0,0.15)',
                    overflowY: 'auto',
                    animation: 'slideIn 0.3s ease'
                  }}
                >
                  {/* Logo & Close */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <Link to="/" onClick={toggleMenu} className="d-flex align-items-center" style={{ gap: '8px' }}>
                      <img src="/assets/images/logo.svg" alt="Checkscam" style={{ maxWidth: '120px' }} />
                      <i className="fas fa-lock lock-icon" title="An toàn" style={{ fontSize: '20px' }}></i>
                    </Link>
                    <button 
                      onClick={toggleMenu}
                      style={{
                        width: '40px',
                        height: '40px',
                        background: '#f1f5f9',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        color: '#64748b'
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  {/* Menu Items */}
                  <nav style={{ padding: '10px 0' }}>
                    <Link to="/" onClick={toggleMenu} style={{
                      display: 'block',
                      padding: '15px 25px',
                      color: '#1a1a2e',
                      textDecoration: 'none',
                      fontWeight: '500',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <i className="fas fa-home" style={{ marginRight: '12px', color: '#0ea5e9' }}></i>
                      Trang chủ
                    </Link>
                    <Link to="/about" onClick={toggleMenu} style={{
                      display: 'block',
                      padding: '15px 25px',
                      color: '#1a1a2e',
                      textDecoration: 'none',
                      fontWeight: '500',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <i className="fas fa-info-circle" style={{ marginRight: '12px', color: '#0ea5e9' }}></i>
                      Giới thiệu
                    </Link>
                    
                    {/* Dịch vụ */}
                    <div style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{
                        padding: '15px 25px',
                        color: '#1a1a2e',
                        fontWeight: '500'
                      }}>
                        <i className="fas fa-cogs" style={{ marginRight: '12px', color: '#0ea5e9' }}></i>
                        Dịch vụ
                      </div>
                      <div style={{ paddingLeft: '25px', background: '#f8fafc' }}>
                        <Link to="/report" onClick={toggleMenu} style={{
                          display: 'block',
                          padding: '12px 25px',
                          color: '#64748b',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}>
                          <i className="fas fa-flag" style={{ marginRight: '10px' }}></i>
                          Gửi tố cáo scam
                        </Link>
                        <Link to="/marketplace" onClick={toggleMenu} style={{
                          display: 'block',
                          padding: '12px 25px',
                          color: '#64748b',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}>
                          <i className="fas fa-store" style={{ marginRight: '10px' }}></i>
                          Chợ Buôn CS
                        </Link>
                        <Link to="/insurance" onClick={toggleMenu} style={{
                          display: 'block',
                          padding: '12px 25px',
                          color: '#64748b',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}>
                          <i className="fas fa-shield-alt" style={{ marginRight: '10px' }}></i>
                          Check quỹ bảo hiểm
                        </Link>
                        {/* Đã xoá Kiểm tra Scam */}
                      </div>
                    </div>

                    <Link to="/news" onClick={toggleMenu} style={{
                      display: 'block',
                      padding: '15px 25px',
                      color: '#1a1a2e',
                      textDecoration: 'none',
                      fontWeight: '500',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <i className="fas fa-newspaper" style={{ marginRight: '12px', color: '#0ea5e9' }}></i>
                      Tin tức
                    </Link>
                    <Link to="/contact" onClick={toggleMenu} style={{
                      display: 'block',
                      padding: '15px 25px',
                      color: '#1a1a2e',
                      textDecoration: 'none',
                      fontWeight: '500',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <i className="fas fa-envelope" style={{ marginRight: '12px', color: '#0ea5e9' }}></i>
                      Liên hệ
                    </Link>
                  </nav>
                </div>
              )}

              {/* Desktop Navigation */}
              <div 
                id="header-navigation" 
                className="header-navigation d-none d-lg-flex align-items-center justify-content-end"
              >
                <ul>
                  <li>
                    <Link to="/">TRANG CHỦ</Link>
                  </li>
                  <li>
                    <Link to="/about">GIỚI THIỆU</Link>
                  </li>
                  <li>
                    <Link to="#">
                      DỊCH VỤ <i className="far fa-angle-down"></i>
                    </Link>
                    <ul>
                      <li><Link to="/report">Gửi tố cáo scam</Link></li>
                      <li><Link to="/marketplace">Chợ Buôn CS</Link></li>
                      <li><Link to="/insurance">Check quỹ bảo hiểm</Link></li>
                      {/* Đã xoá Kiểm tra Scam */}
                    </ul>
                  </li>
                  <li>
                    <Link to="/news">TIN TỨC</Link>
                  </li>
                  <li>
                    <Link to="/terms">ĐIỀU KHOẢN</Link>
                  </li>
                  <li>
                    <Link to="/contact">LIÊN HỆ</Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* <div className="col-lg-3">
              <div className="header-button d-none d-lg-flex align-items-center justify-content-end">
                <form onSubmit={handleSearch} className="header-search-form">
                  <input 
                    type="text" 
                    className="search-input"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="search-btn">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div 
          className="header-overlay" 
          id="header-overlay"
          onClick={toggleMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000
          }}
        ></div>
      )}
    </header>
  );
};

export default Header;
