import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

const UserModal = ({ isOpen, onClose, onSave, token, apiUrl, user = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'student',
    program: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);

  const isEditing = !!user;

  const baseUrl = useMemo(() => (
    apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:5001'
  ), [apiUrl]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        password: '',
        role: user.role || 'student',
        program: user.program?._id || user.program || '',
        department: user.department?._id || user.department || '',
      });
    } else {
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'student',
        program: '',
        department: '',
      });
    }
    setError('');
  }, [user, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!token) return;

    const fetchOptions = async () => {
      try {
        const [programRes, deptRes] = await Promise.all([
          fetch(`${baseUrl}/api/programs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseUrl}/api/departments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [programData, deptData] = await Promise.all([
          programRes.json().catch(() => []),
          deptRes.json().catch(() => []),
        ]);

        if (programRes.ok) setPrograms(programData);
        if (deptRes.ok) setDepartments(deptData);
      } catch {
        // Keep modal usable (name/username/password) even if options fail
      }
    };

    fetchOptions();
  }, [isOpen, token, baseUrl]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!formData.name || !formData.username) {
        throw new Error('Name and username are required');
      }
      if (!isEditing && !formData.password) {
        throw new Error('Password is required for new users');
      }

      const payload = {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        program: formData.role === 'student' ? (formData.program || undefined) : undefined,
        department: formData.role === 'teacher' ? (formData.department || undefined) : undefined,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X className="w-4 h-4" />
        </button>
        
        <h3 className="font-bold text-lg mb-4">
          {isEditing ? 'Edit User' : 'Add New User'}
        </h3>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              className="input input-bordered w-full"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">
                Password {isEditing && '(leave blank to keep current)'}
              </span>
            </label>
            <input
              type="password"
              name="password"
              placeholder={isEditing ? 'Enter new password' : 'Enter password'}
              className="input input-bordered w-full"
              value={formData.password}
              onChange={handleChange}
              required={!isEditing}
            />
          </div>

          <div className="form-control w-full mb-6">
            <label className="label">
              <span className="label-text">Role</span>
            </label>
            <select
              name="role"
              className="select select-bordered w-full"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === 'student' && (
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text">Program</span>
              </label>
              <select
                name="program"
                className="select select-bordered w-full"
                value={formData.program}
                onChange={handleChange}
              >
                <option value="">Select program (optional)</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.level ? `(${p.level})` : ''}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Students can only see courses in their program.
                </span>
              </label>
            </div>
          )}

          {formData.role === 'teacher' && (
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text">Department</span>
              </label>
              <select
                name="department"
                className="select select-bordered w-full"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select department (optional)</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}{d.faculty?.name ? ` (${d.faculty.name})` : ''}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Used for course assignment validation.
                </span>
              </label>
            </div>
          )}

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose}></div>
    </dialog>
  );
};

export default UserModal;
