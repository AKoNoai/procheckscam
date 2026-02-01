import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

const ContactAdmin = () => {
	const [contacts, setContacts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchContacts();
		const interval = setInterval(fetchContacts, 5000); // reload mỗi 5 giây
		return () => clearInterval(interval);
	}, []);

	const fetchContacts = async () => {
		try {
			setLoading(true);
			setError("");
			const res = await api.get('/contacts');
			setContacts(res.data.data || []);
		} catch (e) {
			setContacts([]);
			setError(e?.response?.data?.message || e.message || "Lỗi không xác định");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AdminLayout>
			<div className="container py-4">
				<h2>Liên hệ người dùng</h2>
				{loading ? (
					<div>Đang tải...</div>
				) : error ? (
					<div style={{color: 'red'}}>Lỗi: {error}</div>
				) : (
					<div className="table-responsive">
						<table className="table table-bordered table-sm">
							<thead>
								<tr>
									<th>Thời gian</th>
									<th>Họ tên</th>
									<th>Email</th>
									<th>SĐT</th>
									<th>Chủ đề</th>
									<th>Nội dung</th>
								</tr>
							</thead>
							<tbody>
								{contacts.map(c => (
									<tr key={c._id}>
										<td>{new Date(c.createdAt).toLocaleString('vi-VN')}</td>
										<td>{c.name}</td>
										<td>{c.email}</td>
										<td>{c.phone}</td>
										<td>{c.subject}</td>
										<td>{c.message}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</AdminLayout>
	);
};

export default ContactAdmin;
