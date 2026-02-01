import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';
// import ImageLibraryModal from '../../components/ImageLibraryModal';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: '', imageUrl: '', link: '', isActive: true });
  // const [showImageModal, setShowImageModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/banners');
      setBanners(res.data.data || []);
    } catch (e) {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };


  // Xử lý chọn file ảnh từ máy
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new window.FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, imageUrl: reader.result })); // base64
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/banners/${editingId}`, form);
      } else {
        await api.post('/banners', form);
      }
      setForm({ title: '', imageUrl: '', link: '', isActive: true });
      setEditingId(null);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (b) => {
    setEditingId(b._id);
    setForm({ title: b.title || '', imageUrl: b.imageUrl || '', link: b.link || '', isActive: !!b.isActive });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa banner này?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page container">
        <h2>Quản lý Banner</h2>

        <div className="card p-3 mb-4">
          <form onSubmit={handleSubmit} className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Tiêu đề</label>
              <input name="title" value={form.title} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Ảnh banner</label>
              <div className="d-flex align-items-center gap-2">
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="banner" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }} />
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">Link</label>
              <input name="link" value={form.link} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-1">
              <label className="form-label">Hoạt động</label>
              <div>
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              </div>
            </div>
            <div className="col-md-1 text-end">
              <button className="btn btn-primary">{editingId ? 'Cập nhật' : 'Tạo'}</button>
            </div>
          </form>
        </div>

        <div className="card p-3">
          <h5>Danh sách banner</h5>
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tiêu đề</th>
                    <th>Link</th>
                    <th>Active</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map(b => (
                    <tr key={b._id}>
                      <td style={{width:120}}>
                        <img src={b.imageUrl} alt={b.title} style={{width:120,objectFit:'cover'}} />
                      </td>
                      <td>{b.title}</td>
                      <td><a href={b.link || '#'} target="_blank" rel="noreferrer">{b.link || '-'}</a></td>
                      <td>{b.isActive ? 'Yes' : 'No'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(b)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default BannerManagement;
