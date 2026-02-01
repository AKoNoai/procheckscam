import React from 'react';

// Thư viện ảnh mẫu, có thể thay bằng API thực tế
const IMAGE_LIBRARY = [
  {
    url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    name: 'Ảnh mặc định',
  },
  {
    url: 'https://i.imgur.com/0y0y0y0.png',
    name: 'Ảnh mẫu 1',
  },
  {
    url: 'https://i.imgur.com/1a1a1a1.png',
    name: 'Ảnh mẫu 2',
  },
  {
    url: 'https://i.imgur.com/2b2b2b2.png',
    name: 'Ảnh mẫu 3',
  },
];

const ImageLibraryModal = ({ show, onClose, onSelect }) => {
  if (!show) return null;
  return (
    <div className="modal-backdrop" style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.3)', zIndex: 9999 }}>
      <div className="modal-dialog" style={{ maxWidth: 500, margin: '60px auto', background: '#fff', borderRadius: 8, padding: 24, position: 'relative' }}>
        <h5>Chọn ảnh từ thư viện</h5>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, margin: '16px 0' }}>
          {IMAGE_LIBRARY.map(img => (
            <div key={img.url} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => { onSelect(img.url); onClose(); }}>
              <img src={img.url} alt={img.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '2px solid #eee' }} />
              <div style={{ fontSize: 13, marginTop: 4 }}>{img.name}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={onClose} style={{ position: 'absolute', top: 8, right: 8 }}>Đóng</button>
      </div>
    </div>
  );
};

export default ImageLibraryModal;
