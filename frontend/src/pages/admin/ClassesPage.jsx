import { useEffect, useMemo, useState, useCallback } from 'react';
import { Plus, ClipboardList, GraduationCap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';

const SECTION_VALUES = ['Regular', 'Self Support 1', 'Self Support 2'];

const ClassesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    program: '',
    section: 'Regular',
    startYear: '',
    endYear: '',
  });

  const [copyFromClassId, setCopyFromClassId] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const selectedProgram = useMemo(
    () => programs.find((p) => p._id === formData.program),
    [programs, formData.program]
  );

  const copyFromClass = useMemo(
    () => classes.find((c) => c._id === copyFromClassId),
    [classes, copyFromClassId]
  );

  const baseKeyFor = useCallback((classOrForm) => {
    const programId = classOrForm?.program?._id || classOrForm?.program || '';
    const startYear = classOrForm?.session?.startYear ?? classOrForm?.startYear;
    const endYear = classOrForm?.session?.endYear ?? classOrForm?.endYear;
    if (!programId || !startYear || !endYear) return '';
    return `${programId}|${startYear}|${endYear}`;
  }, []);

  const takenSectionsForCurrentBase = useMemo(() => {
    const baseKey = baseKeyFor({
      program: formData.program,
      startYear: formData.startYear,
      endYear: formData.endYear,
    });
    if (!baseKey) return new Set();
    return new Set(
      classes
        .filter((c) => baseKeyFor(c) === baseKey)
        .map((c) => c.section)
        .filter(Boolean)
    );
  }, [classes, baseKeyFor, formData.program, formData.startYear, formData.endYear]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/classes`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, user?.token]);

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/programs`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) setPrograms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch programs:', err);
    }
  }, [apiUrl, user?.token]);

  useEffect(() => {
    fetchClasses();
    fetchPrograms();
  }, [fetchClasses, fetchPrograms]);

  const openAddModal = () => {
    setFormData({ program: '', section: 'Regular', startYear: '', endYear: '' });
    setCopyFromClassId('');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedProgram) {
      setError('Select a program');
      return;
    }

    const startYear = Number(formData.startYear);
    const endYear = Number(formData.endYear);
    if (!Number.isInteger(startYear) || !Number.isInteger(endYear)) {
      setError('Start year and end year must be valid numbers');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        program: selectedProgram._id,
        discipline: selectedProgram.discipline?._id,
        department: selectedProgram.discipline?.department?._id,
        section: formData.section,
        session: { startYear, endYear },
      };

      const response = await fetch(`${apiUrl}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create class');

      setIsModalOpen(false);
      fetchClasses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Classes</h1>
            <p className="text-base-content/60 mt-1">Create and view class sections</p>
          </div>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {classes.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                <p className="text-base-content/60">No classes found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Program</th>
                      <th>Session</th>
                      <th>Section</th>
                      <th>Discipline</th>
                      <th>Department</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((c) => (
                      <tr key={c._id} className="hover">
                        <td className="font-medium">{c.program?.level} {c.program?.discipline?.name}</td>
                        <td className="text-base-content/70">{c.sessionLabel || `${c.session?.startYear}-${c.session?.endYear}`}</td>
                        <td className="text-base-content/70">{c.section}</td>
                        <td className="text-base-content/70">{c.discipline?.name}</td>
                        <td className="text-base-content/70">{c.department?.name}</td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/teacher/attendance`, { state: { classId: c._id } })}>
                              <Eye className="w-4 h-4" />
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
        </div>

        {isModalOpen && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Add Class</h3>
              {error && (
                <div className="alert alert-error mb-3">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Copy From Existing (optional)</span></label>
                  <select
                    className="select select-bordered"
                    value={copyFromClassId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setCopyFromClassId(nextId);

                      const picked = classes.find((c) => c._id === nextId);
                      if (picked) {
                        setFormData((prev) => ({
                          ...prev,
                          program: picked.program?._id || '',
                          startYear: String(picked.session?.startYear ?? ''),
                          endYear: String(picked.session?.endYear ?? ''),
                        }));
                      }
                    }}
                  >
                    <option value="">No (fill manually)</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.program?.discipline?.name} ({c.program?.program}) – {c.sessionLabel || `${c.session?.startYear}-${c.session?.endYear}`} – {c.section}
                      </option>
                    ))}
                  </select>
                  {copyFromClass && (
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Program and session were prefilled; pick a section.
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Program</span></label>
                  <select
                    className="select select-bordered"
                    value={formData.program}
                    onChange={(e) => {
                      setCopyFromClassId('');
                      setFormData({ ...formData, program: e.target.value });
                    }}
                    required
                  >
                    <option value="">Select program</option>
                    {programs.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.discipline?.name} ({p.program}) – {p.discipline?.department?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label"><span className="label-text">Start Year</span></label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={formData.startYear}
                      onChange={(e) => {
                        setCopyFromClassId('');
                        setFormData({ ...formData, startYear: e.target.value });
                      }}
                      placeholder="e.g. 2024"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">End Year</span></label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={formData.endYear}
                      onChange={(e) => {
                        setCopyFromClassId('');
                        setFormData({ ...formData, endYear: e.target.value });
                      }}
                      placeholder="e.g. 2028"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Section</span></label>
                  <select
                    className="select select-bordered"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                  >
                    {SECTION_VALUES.map((s) => (
                      <option
                        key={s}
                        value={s}
                        disabled={takenSectionsForCurrentBase.has(s)}
                      >
                        {s}{takenSectionsForCurrentBase.has(s) ? ' (already exists)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-base-200 rounded-lg p-3 text-sm flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span className="font-semibold">Department / Discipline</span>
                  </div>
                  <p>
                    {selectedProgram?.discipline?.department?.name || 'Pick a program to auto-fill department'}
                  </p>
                  <p className="text-base-content/60">
                    {selectedProgram?.discipline?.name || 'Discipline will match selected program'}
                  </p>
                </div>

                <div className="modal-action">
                  <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={`btn btn-primary ${saving ? 'loading' : ''}`} disabled={saving}>
                    {saving ? 'Saving...' : 'Create Class'}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-backdrop bg-black/50" onClick={() => setIsModalOpen(false)}></div>
          </dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClassesPage;
