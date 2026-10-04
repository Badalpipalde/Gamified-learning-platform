import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../assets/styles/pages/manage.css';

function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/admin/teachers');
      setTeachers(data);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await api.post('/admin/teachers', form);
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      fetchTeachers();
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to create teacher'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this teacher?')) {
      try {
        await api.delete(`/admin/teachers/${id}`);
        fetchTeachers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove teacher');
      }
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container manage-page">
      <div className="page-header">
        <h1>Teachers</h1>
        <p>Create and manage teacher accounts.</p>
      </div>

      <div className="actions-bar">
        <div className="stat-card">
          <div className="stat-card-value">{teachers.length}</div>
          <div className="stat-card-label">Total teachers</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Teacher'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>New Teacher</h3>
          {formError && <div className="auth-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="teacher-name">
                Full Name
              </label>
              <input
                id="teacher-name"
                className="form-input"
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="teacher-email">
                Email
              </label>
              <input
                id="teacher-email"
                className="form-input"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="teacher-password">
                Password
              </label>
              <input
                id="teacher-password"
                className="form-input"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Teacher'}
            </button>
          </form>
        </div>
      )}

      {teachers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👨‍🏫</div>
          <p>No teachers yet. Add your first teacher above.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t._id}>
                  <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {t.name}
                  </td>
                  <td>{t.email}</td>
                  <td>
                    <span
                      className={`badge ${t.active !== false ? 'badge-success' : 'badge-danger'}`}
                    >
                      <span
                        className={`status-dot ${t.active !== false ? 'active' : 'inactive'}`}
                        style={{ marginRight: '6px' }}
                      ></span>
                      {t.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {new Date(t.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(t._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TeacherManagement;
