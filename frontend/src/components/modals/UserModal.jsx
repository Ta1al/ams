import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

const SECTION_VALUES = ['Regular', 'Self Support 1', 'Self Support 2'];

const UserModal = ({ isOpen, onClose, onSave, token, apiUrl, user = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'student',
    program: '',
    class: '',
    classBaseKey: '',
    classSection: 'Regular',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [programs, setPrograms] = useState([]);
  const [classes, setClasses] = useState([]);

  const isEditing = !!user;
  const isEditingAdminUser = isEditing && user?.role === 'admin';

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
        class: user.class?._id || user.class || '',
        classBaseKey: '',
        classSection: 'Regular',
      });
    } else {
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'student',
        program: '',
        class: '',
        classBaseKey: '',
        classSection: 'Regular',
      });
    }
    setError('');
  }, [user, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!token) return;

    const fetchOptions = async () => {
      try {
        const programRes = await fetch(`${baseUrl}/api/programs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const programData = await programRes.json().catch(() => []);

        if (programRes.ok) setPrograms(programData);
      } catch {
        // Keep modal usable (name/username/password) even if options fail
      }
    };

    fetchOptions();
  }, [isOpen, token, baseUrl]);

  useEffect(() => {
    if (!isOpen) return;
    if (!token) return;
    if (formData.role !== 'student') {
      setClasses([]);
      return;
    }

    if (!formData.program) {
      setClasses([]);
      return;
    }

    const fetchClasses = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/classes?program=${formData.program}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => []);
        if (res.ok) setClasses(Array.isArray(data) ? data : []);
      } catch {
        setClasses([]);
      }
    };

    fetchClasses();
  }, [isOpen, token, baseUrl, formData.role, formData.program]);

  const baseKeyForClass = useMemo(() => {
    return (c) => {
      const programId = c?.program?._id || c?.program || formData.program || '';
      const startYear = c?.session?.startYear;
      const endYear = c?.session?.endYear;
      if (!programId || !startYear || !endYear) return '';
      return `${programId}|${startYear}|${endYear}`;
    };
  }, [formData.program]);

  const classBaseOptions = useMemo(() => {
    const seen = new Set();
    const bases = [];

    for (const c of classes) {
      const key = baseKeyForClass(c);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      bases.push({
        key,
        label: `${c.program?.name || 'Class'}${c.program?.level ? ` (${c.program.level})` : ''} · ${c.sessionLabel || `${c.session?.startYear}-${c.session?.endYear}`}`,
      });
    }

    bases.sort((a, b) => a.label.localeCompare(b.label));
    return bases;
  }, [classes, baseKeyForClass]);

  const availableSectionsForSelectedBase = useMemo(() => {
    if (!formData.classBaseKey) return new Set();
    return new Set(
      classes
        .filter((c) => baseKeyForClass(c) === formData.classBaseKey)
        .map((c) => c.section)
        .filter(Boolean)
    );
  }, [classes, baseKeyForClass, formData.classBaseKey]);

  const resolveClassId = useMemo(() => {
    return (baseKey, section) => {
      if (!baseKey || !section) return '';
      const match = classes.find((c) => baseKeyForClass(c) === baseKey && c.section === section);
      return match?._id || '';
    };
  }, [classes, baseKeyForClass]);

  useEffect(() => {
    if (!isOpen) return;
    if (formData.role !== 'student') return;
    if (!formData.program) return;
    if (!classes.length) return;

    // If we already have a class id (edit mode), derive baseKey/section for UI.
    if (formData.class && (!formData.classBaseKey || !formData.classSection)) {
      const current = classes.find((c) => c._id === formData.class);
      if (current) {
        setFormData((prev) => ({
          ...prev,
          classBaseKey: baseKeyForClass(current),
          classSection: current.section || prev.classSection || 'Regular',
        }));
      }
      return;
    }

    // If base+section are selected but classId isn't, derive it.
    if (!formData.class && formData.classBaseKey && formData.classSection) {
      const nextId = resolveClassId(formData.classBaseKey, formData.classSection);
      if (nextId) {
        setFormData((prev) => ({ ...prev, class: nextId }));
      }
    }
  }, [
    isOpen,
    classes,
    formData.role,
    formData.program,
    formData.class,
    formData.classBaseKey,
    formData.classSection,
    baseKeyForClass,
    resolveClassId,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };

    if (name === 'program') {
      next.class = '';
      next.classBaseKey = '';
      next.classSection = 'Regular';
    }

    if (name === 'role') {
      // When switching roles, clear fields that don't apply.
      if (value === 'teacher') {
        next.program = '';
        next.class = '';
        next.classBaseKey = '';
        next.classSection = 'Regular';
      }
    }

    setFormData(next);
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
        class: formData.role === 'student' ? (formData.class || undefined) : undefined,
        department: undefined,
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
            {isEditingAdminUser ? (
              <select
                name="role"
                className="select select-bordered w-full"
                value="admin"
                disabled
              >
                <option value="admin">Admin</option>
              </select>
            ) : (
              <select
                name="role"
                className="select select-bordered w-full"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            )}
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
                required
              >
                <option value="">Select program</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.level ? `(${p.level})` : ''}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Students must be assigned to a class.
                </span>
              </label>
            </div>
          )}

          {formData.role === 'student' && !!formData.program && (
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text">Class (Batch)</span>
              </label>
              <select
                name="classBaseKey"
                className="select select-bordered w-full"
                value={formData.classBaseKey}
                onChange={(e) => {
                  const baseKey = e.target.value;
                  const availableSections = classes
                    .filter((c) => baseKeyForClass(c) === baseKey)
                    .map((c) => c.section)
                    .filter(Boolean);

                  const preferred = availableSections.includes('Regular')
                    ? 'Regular'
                    : (availableSections[0] || 'Regular');

                  const nextId = resolveClassId(baseKey, preferred);
                  setFormData((prev) => ({
                    ...prev,
                    classBaseKey: baseKey,
                    classSection: preferred,
                    class: nextId || '',
                  }));
                }}
                required
              >
                <option value="">Select class</option>
                {classBaseOptions.map((b) => (
                  <option key={b.key} value={b.key}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.role === 'student' && !!formData.classBaseKey && (
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text">Section</span>
              </label>
              <select
                name="classSection"
                className="select select-bordered w-full"
                value={formData.classSection}
                onChange={(e) => {
                  const nextSection = e.target.value;
                  const nextId = resolveClassId(formData.classBaseKey, nextSection);
                  setFormData((prev) => ({
                    ...prev,
                    classSection: nextSection,
                    class: nextId || '',
                  }));
                }}
                required
              >
                <option value="">Select section</option>
                {SECTION_VALUES.map((s) => (
                  <option
                    key={s}
                    value={s}
                    disabled={!availableSectionsForSelectedBase.has(s)}
                  >
                    {s}{formData.classBaseKey && !availableSectionsForSelectedBase.has(s) ? ' (not created)' : ''}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  If a section is disabled, ask Admin to create that section first.
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
                    {d.name}
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
