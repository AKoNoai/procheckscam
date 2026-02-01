import './Footer.css';
import React from 'react';
import MobileTabBar from './MobileTabBar';

const Footer = () => {
  return (
    <>
      <footer className="simple-footer">
        <div className="footer-lock">
          <i className="fas fa-lock" aria-hidden="true"></i>
        </div>
        <div className="footer-links">
          <button type="button" className="footer-link-btn">Liên hệ AD | Quảng cáo</button>
        </div>
        <div className="footer-links">
          <button type="button" className="footer-link-btn">Đăng ký bảo hiểm Cs</button>
          <span> ★ </span>
          <button type="button" className="footer-link-btn">Nội quy box giao dịch</button>
        </div>
        <div className="footer-ceo">
          Project Founder and CEO: <strong>Long Đỉnh</strong>
        </div>
      </footer>
      <MobileTabBar />
    </>
  );
};

export default Footer;
