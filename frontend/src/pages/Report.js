import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './Report.css';
import Banner from '../components/Banner';

const Report = () => {
  const [activeTab, setActiveTab] = useState('bank');
  // const [bankScamCount, setBankScamCount] = useState(null);
  // Lấy tổng số tài khoản scam đã được xác thực
  useEffect(() => {
    const fetchBankScamCount = async () => {
      try {
        // Lấy tất cả report đã duyệt, channel=bank
        // const res = await api.get('/reports/public?limit=1000&channel=bank');
        // Đếm số report có targetBankAccount khác rỗng
        // const count = Array.isArray(res.data.data)
        //   ? res.data.data.filter(r => r.targetContact && r.targetContact.bankAccount && r.targetContact.bankAccount.trim() !== '').length
        //   : 0;
        // setBankScamCount(count);
      } catch (e) {
        // setBankScamCount(null);
      }
    };
    fetchBankScamCount();
  }, []);

  const [bankForm, setBankForm] = useState({
    targetName: '',
    targetBankAccount: '',
    targetBankName: '',
    targetFacebook: '',
    description: '',
    reporterName: '',
    reporterZalo: '',
    agreementChoice: 'victim' // victim | group
  });

  const [websiteForm, setWebsiteForm] = useState({
    targetWebsite: '',
    category: '',
    description: '',
    reporterEmail: '',
    agreement: false
  });

  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const previews = useMemo(() => {
    return evidenceFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
  }, [evidenceFiles]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const onPickFiles = (e) => {
    let files = Array.from(e.target.files || []);
    if (files.length > 10) {
      files = files.slice(0, 10);
      alert('Chỉ được gửi tối đa 10 hình ảnh minh chứng!');
    }
    setEvidenceFiles(files);
  };

  const onChangeBank = (e) => {
    const { name, value } = e.target;
    setBankForm((prev) => ({ ...prev, [name]: value }));
  };

  const onChangeWebsite = (e) => {
    const { name, value, type, checked } = e.target;
    setWebsiteForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      evidenceFiles.forEach((f) => formData.append('evidence', f));

      if (activeTab === 'bank') {
        formData.append('channel', 'bank');
        formData.append('reportType', 'scam');

        formData.append('targetName', bankForm.targetName);
        formData.append('targetBankAccount', bankForm.targetBankAccount);
        formData.append('targetBankName', bankForm.targetBankName);
        if (bankForm.targetFacebook) formData.append('targetFacebook', bankForm.targetFacebook);

        formData.append('description', bankForm.description);
        formData.append('reporterName', bankForm.reporterName);
        formData.append('reporterZalo', bankForm.reporterZalo);
        formData.append('agreement', 'true');
      } else {
        if (!websiteForm.agreement) {
          setMessage({ type: 'error', text: 'Vui lòng đồng ý với các điều khoản báo cáo.' });
          setLoading(false);
          return;
        }

        formData.append('channel', 'website');
        formData.append('reportType', 'scam');

        formData.append('targetWebsite', websiteForm.targetWebsite);
        formData.append('category', websiteForm.category);
        formData.append('description', websiteForm.description);
        formData.append('reporterEmail', websiteForm.reporterEmail);
        formData.append('agreement', websiteForm.agreement ? 'true' : 'false');
      }

      await api.post('/reports', formData);
      
      setMessage({ 
        type: 'success', 
        text: 'Gửi duyệt thành công! Admin sẽ xem xét và phê duyệt trong thời gian sớm nhất.' 
      });
      
      setEvidenceFiles([]);

      setBankForm({
        targetName: '',
        targetBankAccount: '',
        targetBankName: '',
        targetFacebook: '',
        description: '',
        reporterName: '',
        reporterZalo: '',
        agreementChoice: 'victim'
      });

      setWebsiteForm({
        targetWebsite: '',
        category: '',
        description: '',
        reporterEmail: '',
        agreement: false
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      {message.text && (
        <div className={`report-alert ${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="report-card">

        <div className="report-lock">
          <i className="fas fa-lock" aria-hidden="true"></i>
        </div>

        <div className="report-title">ĐIỀN THÔNG TIN TỐ CÁO</div>

        <div className="report-tabs" role="tablist" aria-label="Report tabs">
          <button
            type="button"
            className={`report-tab ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
            role="tab"
            aria-selected={activeTab === 'bank'}
          >
            Số Tài Khoản Scam
          </button>
          <button
            type="button"
            className={`report-tab ${activeTab === 'website' ? 'active' : ''}`}
            onClick={() => setActiveTab('website')}
            role="tab"
            aria-selected={activeTab === 'website'}
          >
            Website, Link Scam
          </button>
        </div>

        <form className="report-form" onSubmit={handleSubmit}>
          {activeTab === 'bank' ? (
            <>
              <div className="report-grid">
                <div className="report-field">
                  <label>
                    Tên chủ tài khoản <span className="report-required">*</span>
                  </label>
                  <input
                    name="targetName"
                    value={bankForm.targetName}
                    onChange={onChangeBank}
                    placeholder="Chủ tài khoản nhận tiền"
                    required
                  />
                </div>
                <div className="report-field">
                  <label>
                    Số tài khoản <span className="report-required">*</span>
                  </label>
                  <input
                    name="targetBankAccount"
                    value={bankForm.targetBankAccount}
                    onChange={onChangeBank}
                    placeholder="Số tài khoản nhận tiền"
                    required
                  />
                </div>

                <div className="report-field">
                  <label>
                    Ngân hàng <span className="report-required">*</span>
                  </label>
                  <input
                    name="targetBankName"
                    value={bankForm.targetBankName}
                    onChange={onChangeBank}
                    placeholder="Ngân hàng"
                    required
                  />
                </div>
                <div className="report-field">
                  <label>Link Facebook (nếu có)</label>
                  <input
                    name="targetFacebook"
                    value={bankForm.targetFacebook}
                    onChange={onChangeBank}
                    placeholder="Link facebook kẻ lừa đảo"
                  />
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label className="report-upload">
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={onPickFiles}
                    maxLength={10}
                  />
                  <i className="far fa-plus-square" aria-hidden="true"></i>
                  <span>Tải lên đây đủ bằng chứng...</span>
                </label>

                {evidenceFiles.length > 0 && (
                  <div className="report-evidence-list" aria-label="Selected evidence">
                    {evidenceFiles.map((f) => (
                      <span key={`${f.name}-${f.size}`} className="report-chip">
                        {f.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="report-warning">
                  <strong>⚠ MẸO:</strong> Up ảnh lên Zalo để giảm dung lượng, sau đó tải về up lên web sẽ nhanh hơn. Bài tố cáo cần cung cấp đầy đủ bill chuyển khoản và nội dung trao đổi giao dịch làm bằng chứng thì mới được duyệt...
                </div>
              </div>

              <div className="report-field" style={{ marginTop: 14 }}>
                <label>
                  Nội dung tố cáo <span className="report-required">*</span>
                </label>
                <textarea
                  name="description"
                  value={bankForm.description}
                  onChange={onChangeBank}
                  rows={5}
                  required
                  placeholder="Họ lừa đảo bạn như nào? bao nhiêu tiền? Time bao lâu rồi họ không trả lời, hay block?..."
                />
              </div>

              <div className="report-section-title">NGƯỜI XÁC THỰC</div>

              <div className="report-grid">
                <div className="report-field">
                  <label>
                    Họ và tên <span className="report-required">*</span>
                  </label>
                  <input
                    name="reporterName"
                    value={bankForm.reporterName}
                    onChange={onChangeBank}
                    placeholder="Nhập họ, tên của bạn"
                    required
                  />
                </div>
                <div className="report-field">
                  <label>
                    Zalo liên hệ <span className="report-required">*</span>
                  </label>
                  <input
                    name="reporterZalo"
                    value={bankForm.reporterZalo}
                    onChange={onChangeBank}
                    placeholder="Zalo liên hệ của bạn (mở tìm kiếm)"
                    required
                  />
                </div>
              </div>

              <div className="report-agree" style={{ marginTop: 12 }}>
                <label>
                  <input
                    type="radio"
                    name="agreementChoice"
                    value="group"
                    checked={bankForm.agreementChoice === 'group'}
                    onChange={onChangeBank}
                    required
                  />
                  <span>Cảnh báo này trên group tôi chỉ đăng hộ</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="agreementChoice"
                    value="victim"
                    checked={bankForm.agreementChoice === 'victim'}
                    onChange={onChangeBank}
                    required
                  />
                  <span>Tôi chính là nạn nhân, tôi đồng ý và sẵn sàng chịu trách nhiệm trước pháp luật về nội dung cảnh báo này.</span>
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="report-grid">
                <div className="report-field">
                  <label>
                    Website, đường link <span className="report-required">*</span>
                  </label>
                  <input
                    name="targetWebsite"
                    value={websiteForm.targetWebsite}
                    onChange={onChangeWebsite}
                    placeholder="Link website lừa đảo"
                    required
                  />
                </div>
                <div className="report-field">
                  <label>
                    Thể loại lừa đảo <span className="report-required">*</span>
                  </label>
                  <input
                    name="category"
                    value={websiteForm.category}
                    onChange={onChangeWebsite}
                    placeholder="Thể loại"
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label className="report-upload">
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={onPickFiles}
                  />
                  <i className="far fa-plus-square" aria-hidden="true"></i>
                  <span>Tải bằng chứng (png, jpg, gif)</span>
                </label>

                {evidenceFiles.length > 0 && (
                  <div className="report-evidence-list" aria-label="Selected evidence">
                    {previews.slice(0, 6).map((p) => (
                      <img
                        key={p.url}
                        src={p.url}
                        alt={p.name}
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #e9ecef' }}
                      />
                    ))}
                  </div>
                )}

                {/* Warning block intentionally removed as requested */}
              </div>

              <div className="report-field" style={{ marginTop: 14 }}>
                <label>
                  Nội dung mô tả <span className="report-required">*</span>
                </label>
                <textarea
                  name="description"
                  value={websiteForm.description}
                  onChange={onChangeWebsite}
                  rows={5}
                  required
                  placeholder="Cung cấp bằng chứng...."
                />
              </div>

              <div className="report-field" style={{ marginTop: 14 }}>
                <label>
                  Email liên hệ <span className="report-required">*</span>
                </label>
                <input
                  type="email"
                  name="reporterEmail"
                  value={websiteForm.reporterEmail}
                  onChange={onChangeWebsite}
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>

              <div className="report-agree" style={{ marginTop: 12 }}>
                <label>
                  <input
                    type="checkbox"
                    name="agreement"
                    checked={websiteForm.agreement}
                    onChange={onChangeWebsite}
                  />
                  <span>Tôi đã đọc và đồng ý với các điều khoản báo cáo.</span>
                </label>
              </div>
            </>
          )}

          <div className="report-submit-wrap">
            <button className="report-submit" type="submit" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi Duyệt'}
            </button>
          </div>
        </form>

        <div className="report-footer">
          <div>Group Fb - Discord - Telegram</div>
          <div>
            <a href="#/">Thông tin hệ thống</a> | <a href="#/">Liên hệ hỗ trợ</a> | <a href="#/">Hợp tác quảng cáo</a>
          </div>
        </div>
      </div>
      {/* Site banners */}
      <Banner />
    </div>
  );
};

export default Report;
