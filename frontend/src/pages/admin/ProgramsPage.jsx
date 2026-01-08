import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const ProgramsPage = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [isDivisionModalOpen, setIsDivisionModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ program: 'BS', discipline: '' });
  const [departmentForm, setDepartmentForm] = useState({ name: '' });
  const [divisionForm, setDivisionForm] = useState({ name: '', departmentId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [departmentSaving, setDepartmentSaving] = useState(false);
  const [divisionSaving, setDivisionSaving] = useState(false);
  const [departmentError, setDepartmentError] = useState('');
  const [divisionError, setDivisionError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/programs`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) setPrograms(data);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.token, apiUrl]);

  const fetchDivisions = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/programs/divisions`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) setDivisions(data);
    } catch (error) {
      console.error('Failed to fetch divisions:', error);
    }
  }, [user?.token, apiUrl]);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/departments`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await response.json();
      if (response.ok) setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  }, [user?.token, apiUrl]);

  useEffect(() => {
    fetchPrograms();
    fetchDivisions();
    fetchDepartments();
  }, [fetchPrograms, fetchDivisions, fetchDepartments]);

  const openAddModal = () => {
    setSelectedProgram(null);
    setFormData({ program: 'BS', discipline: '' });
    setError('');
    setIsModalOpen(true);
  };

  const openAddDepartmentModal = () => {
    setDepartmentForm({ name: '' });
    setDepartmentError('');
    setIsDepartmentModalOpen(true);
  };

  const openAddDivisionModal = () => {
    setDivisionForm({ name: '', departmentId: '' });
    setDivisionError('');
    setIsDivisionModalOpen(true);
  };

  const openEditModal = (program) => {
    setSelectedProgram(program);
    setFormData({
      program: program.program,
      discipline: program.discipline?._id || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const url = selectedProgram
        ? `${apiUrl}/api/programs/${selectedProgram._id}`
        : `${apiUrl}/api/programs`;
      const method = selectedProgram ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save');

      fetchPrograms();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    setDepartmentError('');
    setDepartmentSaving(true);

    try {
      const response = await fetch(`${apiUrl}/api/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          name: departmentForm.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create department');

      setIsDepartmentModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setDepartmentError(err.message);
    } finally {
      setDepartmentSaving(false);
    }
  };

  const handleSaveDivision = async (e) => {
    e.preventDefault();
    setDivisionError('');
    setDivisionSaving(true);

    try {
      const response = await fetch(`${apiUrl}/api/divisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          name: divisionForm.name,
          departmentId: divisionForm.departmentId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create discipline');

      setIsDivisionModalOpen(false);
      fetchDivisions();
    } catch (err) {
      setDivisionError(err.message);
    } finally {
      setDivisionSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/programs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (response.ok) {
        setPrograms(programs.filter((p) => p._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
    setDeleteConfirm(null);
  };

  const getProgramBadgeClass = (program) => {
    switch (program) {
      case 'BS': return 'badge-primary';
      case 'MS': return 'badge-secondary';
      case 'PhD': return 'badge-accent';
      default: return 'badge-ghost';
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
            <h1 className="text-3xl font-bold">Programs</h1>
            <p className="text-base-content/60 mt-1">Manage academic programs</p>
          </div>
          <div className="flex gap-2">
            <button onClick={openAddDepartmentModal} className="btn btn-outline">
              <Plus className="w-4 h-4" /> Add Department
            </button>
            <button onClick={openAddDivisionModal} className="btn btn-outline">
              <Plus className="w-4 h-4" /> Add Discipline
            </button>
            <button onClick={openAddModal} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Add Program
            </button>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {programs.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                <p className="text-base-content/60">No programs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Discipline</th>
                      <th>Program</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((p) => (
                      <tr key={p._id} className="hover">
                        <td className="text-base-content/70">{p.discipline?.department?.name || 'N/A'}</td>
                        <td className="font-medium">{p.discipline?.name || 'N/A'}</td>
                        <td>
                          <span className={`badge ${getProgramBadgeClass(p.program)}`}>
                            {p.program}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEditModal(p)} className="btn btn-ghost btn-sm">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(p._id)} className="btn btn-ghost btn-sm text-error">
                              <Trash2 className="w-4 h-4" />
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

        {/* Modal */}
        {isModalOpen && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">
                {selectedProgram ? 'Edit Program' : 'Add New Program'}
              </h3>
              {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}
              <form onSubmit={handleSave}>
                <div className="form-control mb-4">
                  <label className="label"><span className="label-text">Program</span></label>
                  <select
                    className="select select-bordered"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  >
                    <option value="BS">Bachelor (BS)</option>
                    <option value="MS">Master (MS)</option>
                    <option value="PhD">Doctorate (PhD)</option>
                  </select>
                </div>
                <div className="form-control mb-6">
                  <label className="label"><span className="label-text">Discipline</span></label>
                  <select
                    className="select select-bordered"
                    value={formData.discipline}
                    onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                    required
                  >
                    <option value="">Select Discipline</option>
                    {divisions.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.department?.name})
                      </option>
                    ))}
                  </select>
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Missing a discipline? Use “Add Department” / “Add Discipline” above.
                    </span>
                  </label>
                </div>
                <div className="modal-action">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                  <button type="submit" className={`btn btn-primary ${saving ? 'loading' : ''}`} disabled={saving}>
                    {saving ? 'Saving...' : selectedProgram ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-backdrop bg-black/50" onClick={() => setIsModalOpen(false)}></div>
          </dialog>
        )}

        {/* Add Department Modal */}
        {isDepartmentModalOpen && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Add Department</h3>
              {departmentError && <div className="alert alert-error mb-4"><span>{departmentError}</span></div>}
              <form onSubmit={handleSaveDepartment}>
                <div className="form-control mb-6">
                  <label className="label"><span className="label-text">Department Name</span></label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={departmentForm.name}
                    onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-action">
                  <button type="button" onClick={() => setIsDepartmentModalOpen(false)} className="btn btn-ghost">Cancel</button>
                  <button type="submit" className={`btn btn-primary ${departmentSaving ? 'loading' : ''}`} disabled={departmentSaving}>
                    {departmentSaving ? 'Saving...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-backdrop bg-black/50" onClick={() => setIsDepartmentModalOpen(false)}></div>
          </dialog>
        )}

        {/* Add Discipline Modal */}
        {isDivisionModalOpen && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Add Discipline</h3>
              {divisionError && <div className="alert alert-error mb-4"><span>{divisionError}</span></div>}
              <form onSubmit={handleSaveDivision}>
                <div className="form-control mb-4">
                  <label className="label"><span className="label-text">Department</span></label>
                  <select
                    className="select select-bordered"
                    value={divisionForm.departmentId}
                    onChange={(e) => setDivisionForm({ ...divisionForm, departmentId: e.target.value })}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}{d.faculty?.name ? ` (${d.faculty.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control mb-6">
                  <label className="label"><span className="label-text">Discipline Name</span></label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={divisionForm.name}
                    onChange={(e) => setDivisionForm({ ...divisionForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-action">
                  <button type="button" onClick={() => setIsDivisionModalOpen(false)} className="btn btn-ghost">Cancel</button>
                  <button type="submit" className={`btn btn-primary ${divisionSaving ? 'loading' : ''}`} disabled={divisionSaving}>
                    {divisionSaving ? 'Saving...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-backdrop bg-black/50" onClick={() => setIsDivisionModalOpen(false)}></div>
          </dialog>
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Confirm Delete</h3>
              <p className="py-4">Are you sure you want to delete this program?</p>
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

export default ProgramsPage;
