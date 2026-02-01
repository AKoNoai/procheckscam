
import React, { useState, useEffect } from 'react';
import { getBotCheckLinks, setBotCheckLinks } from '../../utils/botCheckLinks';
import AdminLayout from '../../components/AdminLayout';


const BotCheckManagement = () => {
  const [link, setLink] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const arr = getBotCheckLinks();
    setLink(arr.length > 0 ? arr[0].url : '');
  }, []);

  const handleSave = () => {
    if (!link) return;
    setBotCheckLinks([{ url: link }]);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <AdminLayout>
      <div className="admin-page-container">
        <h2>Quản lý BOT CHECK</h2>
        <div className="admin-form-row">
          <input
            type="text"
            placeholder="Nhập link BOT CHECK (Tele, Fb, Zalo, ... )"
            value={link}
            onChange={e => { setLink(e.target.value); setSaved(false); }}
            style={{ minWidth: 320, maxWidth: '100%' }}
          />
          <button onClick={handleSave}>Lưu link</button>
        </div>
        {saved && <div style={{ color: 'green', marginTop: 8 }}>Đã lưu link BOT CHECK!</div>}
        {link && (
          <div style={{ marginTop: 16 }}>
            <b>Link hiện tại:</b> <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BotCheckManagement;
