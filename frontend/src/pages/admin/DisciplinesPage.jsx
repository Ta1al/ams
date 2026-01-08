import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Shapes } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';

const DisciplinesPage = () => {
  const { user } = useAuth();

  const [disciplines, setDisciplines] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ name: '', programId: '' });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const selectedProgram = useMemo(
    () => programs.find((p) => p._id === formData.programId),
    [programs, formData.programId]
  );

  const fetchPrograms = useCallback(async () => {
    const response = await fetch(`${apiUrl}/api/programs`, {
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    const data = await response.json();
    if (response.ok) setPrograms(Array.isArray(data) ? data : []);
  }, [apiUrl, user?.token]);

  const fetchDisciplines = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/disciplines`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) setDisciplines(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch disciplines:', e);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, user?.token]);

  useEffect(() => {
    fetchPrograms();
    fetchDisciplines();
  }, [fetchPrograms, fetchDisciplines]);

  const openAddModal = () => {
    setFormData({ name: '', programId: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.programId) {
      setError('Name and Program are required');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${apiUrl}/api/disciplines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ name: formData.name, programId: formData.programId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create discipline');

      setIsModalOpen(false);
      fetchDisciplines();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/disciplines/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (response.ok) {
        setDisciplines((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (e) {
      console.error('Failed to delete discipline:', e);
    }
    setDeleteConfirm(null);
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
            <h1 className="text-3xl font-bold">Disciplines</h1>
            <p className="text-base-content/60 mt-1">Manage disciplines under programs</p>
          </div>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Discipline
          </button>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {disciplines.length === 0 ? (
              <div className="text-center py-12">
                <Shapes className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                <p className="text-base-content/60">No disciplines found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Program</th>
                      <th>Department</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplines.map((d) => (
                      <tr key={d._id} className="hover">
                        <td className="font-medium">{d.name}</td>
                        <td className="text-base-content/70">{d.program?.name} ({d.program?.level})</td>
                        <td className="text-base-content/70">{d.program?.department?.name || '—'}</td>
                        <td className="text-right">
                          <button
                            onClick={() => setDeleteConfirm(d._id)}
                            className="btn btn-ghost btn-sm text-error"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
              <h3 className="font-bold text-lg mb-4">Add Discipline</h3>
              {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Name</span></label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Program</span></label>
                  <select
                    className="select select-bordered"
                    value={formData.programId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, programId: e.target.value }))}
                    required
                  >
                    <option value="">Select program</option>
                    {programs.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.level}) – {p.department?.name || 'No department'}
                      </option>
                    ))}
                  </select>
                  {selectedProgram && (
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Department: {selectedProgram.department?.name || '—'}
                      </span>
                    </label>
                  )}
                </div>

                <div className="modal-action">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                  <button type="submit" className={`btn btn-primary ${saving ? 'loading' : ''}`} disabled={saving}>
                    {saving ? 'Saving...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-backdrop bg-black/50" onClick={() => setIsModalOpen(false)}></div>
          </dialog>
        )}

        {deleteConfirm && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Confirm Delete</h3>
              <p className="py-4">Are you sure you want to delete this discipline?</p>
              <div className="modal-action">
                <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="btn btn-error">Delete</button>
              </div>
            </div>
            <div className="modal-backdrop bg-black/50" onClick={() => setDeleteConfirm(null)}></div>
          </dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DisciplinesPage;
