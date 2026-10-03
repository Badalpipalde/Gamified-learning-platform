import { useState, useEffect } from 'react';
import api from '../../services/api';

function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    nameEn: '',
    nameHi: '',
    slug: '',
    icon: '📚'
  });

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/admin/subjects');
      setSubjects(data);
    } catch (err) {
      console.error('Failed to load subjects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/admin/subjects', {
        name: {
          en: formData.nameEn,
          hi: formData.nameHi
        },
        slug: formData.slug,
        icon: formData.icon
      });
      
      setSuccess('Subject created successfully!');
      setFormData({ nameEn: '', nameHi: '', slug: '', icon: '📚' });
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subject');
    }
  };

  if (loading) {
    return <div className="loader"><div className="spinner"></div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Subject Management</h1>
        <p>Add and manage subjects for the curriculum.</p>
      </div>

      <div className="dash-grid">
        {/* Create Subject Form */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Create New Subject</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="nameEn">Name (English)</label>
              <input
                type="text"
                id="nameEn"
                name="nameEn"
                className="form-input"
                value={formData.nameEn}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="nameHi">Name (Hindi)</label>
              <input
                type="text"
                id="nameHi"
                name="nameHi"
                className="form-input"
                value={formData.nameHi}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="slug">Slug (e.g., science)</label>
              <input
                type="text"
                id="slug"
                name="slug"
                className="form-input"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="icon">Emoji Icon</label>
              <input
                type="text"
                id="icon"
                name="icon"
                className="form-input"
                value={formData.icon}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div style={{ color: 'var(--color-success)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>{success}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Create Subject
            </button>
          </form>
        </div>

        {/* Subject List */}
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Existing Subjects</h3>
          {subjects.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No subjects found.</p>
          ) : (
            <div className="activity-list">
              {subjects.map((s) => (
                <div className="activity-item" key={s._id}>
                  <div className="activity-icon">{s.icon}</div>
                  <div className="activity-info">
                    <div className="activity-title">{s.name.en} / {s.name.hi}</div>
                    <div className="activity-meta">Slug: {s.slug}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubjectManagement;
