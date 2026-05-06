import React, { useEffect, useState, useCallback } from 'react';
import type { DepartmentListItem, DepartmentDetail, CreateDepartmentForm, UpdateDepartmentForm } from '@/types/admin';
import { DEPARTMENT_TYPE_LABELS } from '@/lib/enums';
import {
  fetchDepartments, fetchDepartmentDetail, createDepartment,
  updateDepartment, deleteDepartment, setDepartmentHead, removeCourseFromDepartment,
} from '@/lib/departmentApi';
import DepartmentDetailPanel from './DepartmentDetailPanel';

const DEPT_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: '0', label: 'General' },
  { value: '1', label: 'Computer Science' },
  { value: '2', label: 'Information Technology' },
  { value: '3', label: 'Software Engineering' },
  { value: '4', label: 'Artificial Intelligence' },
  { value: '5', label: 'Cyber Security' },
];

export default function AdminDepartments() {
  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [editDept, setEditDept] = useState<DepartmentListItem | null>(null);
  const [viewDept, setViewDept] = useState<DepartmentDetail | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState<CreateDepartmentForm>({ departmentType: 1, code: '', description: '' });
  // Edit form
  const [editForm, setEditForm] = useState<UpdateDepartmentForm>({ code: '', description: '' });
  // Set head
  const [headModal, setHeadModal] = useState<DepartmentListItem | null>(null);
  const [headDoctorId, setHeadDoctorId] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await fetchDepartments({
      departmentType: typeFilter !== '' ? Number(typeFilter) : undefined,
      search: search || undefined,
    });
    setDepartments(result.data);
    setLoading(false);
  }, [search, typeFilter]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await createDepartment(createForm);
    setSubmitting(false);
    if (res.id !== null) { setToast('Department created'); setShowCreate(false); setCreateForm({ departmentType: 1, code: '', description: '' }); loadData(); }
    else setToast(res.error || 'Create failed');
  };

  const handleOpenEdit = (dept: DepartmentListItem) => {
    setEditDept(dept);
    setEditForm({ code: dept.code, description: dept.description });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDept) return;
    setSubmitting(true);
    const res = await updateDepartment(editDept.id, editForm);
    setSubmitting(false);
    if (res.success) { setToast('Department updated'); setEditDept(null); loadData(); }
    else setToast(res.error || 'Update failed');
  };

  const handleView = async (id: number) => {
    const res = await fetchDepartmentDetail(id);
    if (res.data) setViewDept(res.data);
    else setToast(res.error || 'Failed to load details');
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const res = await deleteDepartment(deleteId);
    if (res.success) { setToast('Department deleted'); loadData(); }
    else setToast(res.error || 'Delete failed');
    setDeleteId(null);
  };

  const handleSetHead = async () => {
    if (!headModal) return;
    setSubmitting(true);
    const res = await setDepartmentHead(headModal.id, headDoctorId ? Number(headDoctorId) : null);
    // headDoctorId state stores the raw input; API uses doctorId in request body
    setSubmitting(false);
    if (res.success) { setToast('Department head updated'); setHeadModal(null); loadData(); }
    else setToast(res.error || 'Failed to update head');
  };

  const handleRemoveCourse = async (courseId: number) => {
    if (!viewDept) return;
    const res = await removeCourseFromDepartment(viewDept.id, courseId);
    if (res.success) {
      setToast('Course removed');
      const refreshed = await fetchDepartmentDetail(viewDept.id);
      if (refreshed.data) setViewDept(refreshed.data);
      loadData();
    } else setToast(res.error || 'Failed to remove course');
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
  const selectCls = 'px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Department Management</h1>
          {!loading && <p className="text-xs text-slate-400 mt-0.5">{departments.length} department{departments.length !== 1 ? 's' : ''}</p>}
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"><i className="ri-add-line" /> Add Department</button>
      </div>

      {toast && (<div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2"><i className="ri-check-line" /> {toast}</div>)}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code or description..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selectCls}>
          {DEPT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading && (<div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading departments...</div>)}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Code</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Head</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Doctors</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Students</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Courses</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {departments.map(d => (
                <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">{d.code}</div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{d.description}</p>
                        <p className="text-[10px] text-slate-400">{DEPARTMENT_TYPE_LABELS[d.departmentType as 0 | 1 | 2 | 3 | 4 | 5]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-xs font-medium text-slate-600">{d.code}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{d.headOfDepartmentName || <span className="text-slate-300">—</span>}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{d.doctorsCount}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{d.studentsCount}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{d.coursesCount}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => handleView(d.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500" title="View"><i className="ri-eye-line text-sm" /></button>
                      <button type="button" onClick={() => handleOpenEdit(d)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500" title="Edit"><i className="ri-pencil-line text-sm" /></button>
                      <button type="button" onClick={() => { setHeadModal(d); setHeadDoctorId(d.headOfDepartmentId ? String(d.headOfDepartmentId) : ''); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 text-violet-500" title="Set Head"><i className="ri-shield-star-line text-sm" /></button>
                      <button type="button" onClick={() => setDeleteId(d.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500" title="Delete"><i className="ri-delete-bin-line text-sm" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && departments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-building-line text-3xl text-slate-400" /></div>
          <p className="text-sm text-slate-500">No departments found.</p>
        </div>
      )}

      {viewDept && <DepartmentDetailPanel department={viewDept} onClose={() => setViewDept(null)} onRemoveCourse={handleRemoveCourse} />}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Add Department</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Department Type *</label>
                <select value={createForm.departmentType} onChange={e => setCreateForm(p => ({ ...p, departmentType: Number(e.target.value) }))} className={inputCls}>
                  <option value={0}>General</option><option value={1}>Computer Science</option><option value={2}>Information Technology</option><option value={3}>Software Engineering</option><option value={4}>Artificial Intelligence</option><option value={5}>Cyber Security</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Code *</label>
                  <input type="text" required value={createForm.code} onChange={e => setCreateForm(p => ({ ...p, code: e.target.value }))} className={inputCls} placeholder="e.g. CS" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <input type="text" value={createForm.description || ''} onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))} className={inputCls} placeholder="Optional description" /></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting || !createForm.code} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Creating...</span> : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Edit Department — {editDept.code}</h2>
              <button type="button" onClick={() => setEditDept(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Code</label>
                  <input type="text" value={editForm.code || ''} onChange={e => setEditForm(p => ({ ...p, code: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <input type="text" value={editForm.description || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditDept(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set Head Modal */}
      {headModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Set Department Head</h3>
            <p className="text-xs text-slate-400 mb-4">{headModal.code} — {headModal.description}</p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">Doctor ID</label>
              <input type="number" value={headDoctorId} onChange={e => setHeadDoctorId(e.target.value)} placeholder="Enter doctor ID or leave empty to remove" className={inputCls} />
              <p className="text-[10px] text-slate-400 mt-1">Leave empty to remove the current head.</p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setHeadModal(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="button" onClick={handleSetHead} disabled={submitting} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50">
                {submitting ? 'Saving...' : 'Update Head'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div>
            <h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Department?</h3>
            <p className="text-xs text-slate-500 text-center mb-5">This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}