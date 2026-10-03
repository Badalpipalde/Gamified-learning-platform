import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../assets/styles/pages/manage.css';

function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    section: '',
    teacherId: '',
    school: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/teachers'),
      ]);
      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await api.post('/admin/classes', form);
      setForm({ name: '', section: '', teacherId: '', school: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to create class'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class? Students will be unassigned.')) {
      return;
    }
    try {
      await api.delete(`/admin/classes/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete class');
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
        <h1>Classes</h1>
        <p>Create and manage classes, assign teachers.</p>
      </div>

      <div className="actions-bar">
        <div className="stat-card">
          <div className="stat-card-value">{classes.length}</div>
          <div className="stat-card-label">Total classes</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Class'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>New Class</h3>
          {formError && <div className="auth-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="class-name">
                  Class Name
                </label>
                <input
                  id="class-name"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Class 5"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="class-section">
                  Section
                </label>
                <input
                  id="class-section"
                  className="form-input"
                  type="text"
                  placeholder="e.g. A"
                  value={form.section}
                  onChange={(e) =>
                    setForm({ ...form, section: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="class-teacher">
                Assign Teacher
              </label>
              <select
                id="class-teacher"
                className="form-select"
                value={form.teacherId}
                onChange={(e) =>
                  setForm({ ...form, teacherId: e.target.value })
                }
                required
              >
                <option value="">Select a teacher</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="class-school">
                School
              </label>
              <input
                id="class-school"
                className="form-input"
                type="text"
                placeholder="e.g. Vidya Public School"
                value={form.school}
                onChange={(e) =>
                  setForm({ ...form, school: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Class'}
            </button>
          </form>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏫</div>
          <p>No classes yet. Add your first class above.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Section</th>
                <th>Teacher</th>
                <th>School</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {c.name}
                  </td>
                  <td>{c.section || '—'}</td>
                  <td>{c.teacherId?.name || '—'}</td>
                  <td>{c.school || '—'}</td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDelete(c._id)}
                        title="Delete class"
                      >
                        🗑
                      </button>
                    </div>
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

export default ClassManagement;
