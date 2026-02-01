import React from 'react';
import './InsuranceWarningModal.css';

const InsuranceWarningModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="insurance-warning-modal-overlay">
      <div className="insurance-warning-modal">
        <button className="insurance-warning-modal-close" onClick={onClose} aria-label="Close">
          <span>&times;</span>
        </button>
        <div className="insurance-warning-modal-icon">
          <i className="fas fa-bell" aria-hidden="true"></i>
        </div>
        <div className="insurance-warning-modal-title">
          <a href="/marketplace" style={{color: '#d6002f', fontWeight: 700, textDecoration: 'underline', fontSize: '20px'}}>
            MỞ SHOP RIÊNG, BUÔN BÁN BỀN VỮNG<br/>TRÊN CHỢ BUÔN CS
          </a>
        </div>
        <div className="insurance-warning-modal-warning">
          <b style={{color: 'red'}}>CẢNH BÁO:</b> Hiện nay xuất hiện rất nhiều tài khoản FB, TK ngân hàng, Website, Group và Bot giả mạo nhằm lừa đảo người dùng. Để đảm bảo an toàn, CS đề nghị mọi người cần:
        </div>
        <div className="insurance-warning-modal-link">
          <a href="https://t.me/CheckScamBot" target="_blank" rel="noopener noreferrer" style={{color: '#0056d6', fontWeight: 700}}>[ CHECK REAL – FAKE BẰNG BOT ]</a>
        </div>
        <div className="insurance-warning-modal-note">
          KHI GIAO DỊCH
        </div>
        <button className="insurance-warning-modal-btn" onClick={onClose}>
          Không hiển thị lại ?
        </button>
      </div>
    </div>
  );
};

export default InsuranceWarningModal;
