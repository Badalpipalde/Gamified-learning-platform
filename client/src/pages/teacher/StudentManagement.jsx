import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../assets/styles/pages/manage.css';

function StudentManagement() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNo: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get('/classes/my');
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // Fetch students when class is selected
  useEffect(() => {
    if (!selectedClass) return;
    const fetchStudents = async () => {
      try {
        const { data } = await api.get(`/classes/${selectedClass}/students`);
        setStudents(data);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await api.post(`/students/class/${selectedClass}/students`, form);
      setForm({ name: '', email: '', password: '', rollNo: '' });
      setShowForm(false);
      // Refresh students
      const { data } = await api.get(`/classes/${selectedClass}/students`);
      setStudents(data);
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to add student'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (studentId, currentlyActive) => {
    const action = currentlyActive ? 'deactivate' : 'activate';
    const confirmMsg = currentlyActive
      ? 'Deactivate this student? They will lose access and parent links will be revoked.'
      : 'Reactivate this student?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.patch(`/students/${studentId}/${action}`);
      const { data } = await api.get(`/classes/${selectedClass}/students`);
      setStudents(data);
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} student`);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Students</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🏫</div>
          <p>No class assigned yet. Ask your admin to assign you a class.</p>
        </div>
      </div>
    );
  }

  const activeCount = students.filter((s) => s.active).length;
  const inactiveCount = students.filter((s) => !s.active).length;

  return (
    <div className="page-container manage-page">
      <div className="page-header">
        <h1>Students</h1>
        <p>Manage students in your class.</p>
      </div>

      {/* Class selector */}
      {classes.length > 1 && (
        <div className="form-group" style={{ maxWidth: '280px', marginBottom: 'var(--space-6)' }}>
          <label className="form-label">Select Class</label>
          <select
            className="form-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.section ? `- ${c.section}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="actions-bar">
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div className="stat-card">
            <div className="stat-card-value">{activeCount}</div>
            <div className="stat-card-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{inactiveCount}</div>
            <div className="stat-card-label">Inactive</div>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Student'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>New Student</h3>
          {formError && <div className="auth-error">{formError}</div>}
          <form onSubmit={handleAddStudent}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="student-name">
                  Full Name
                </label>
                <input
                  id="student-name"
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
                <label className="form-label" htmlFor="student-rollno">
                  Roll No
                </label>
                <input
                  id="student-rollno"
                  className="form-input"
                  type="text"
                  placeholder="e.g. 5A-01"
                  value={form.rollNo}
                  onChange={(e) =>
                    setForm({ ...form, rollNo: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="student-email">
                Email
              </label>
              <input
                id="student-email"
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
              <label className="form-label" htmlFor="student-password">
                Password
              </label>
              <input
                id="student-password"
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
              {submitting ? 'Adding...' : 'Add Student'}
            </button>
          </form>
        </div>
      )}

      {students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p>No students in this class yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.rollNo || '—'}</td>
                  <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {s.name}
                  </td>
                  <td>{s.email}</td>
                  <td>
                    <span
                      className={`badge ${s.active ? 'badge-success' : 'badge-danger'}`}
                    >
                      <span
                        className={`status-dot ${s.active ? 'active' : 'inactive'}`}
                        style={{ marginRight: '6px' }}
                      ></span>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-accent">
                      {s.totalPoints || 0} pts
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className={`btn btn-sm ${s.active ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() =>
                          handleToggleActive(s._id, s.active)
                        }
                      >
                        {s.active ? 'Deactivate' : 'Activate'}
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

export default StudentManagement;
