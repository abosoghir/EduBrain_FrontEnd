import React, { useEffect, useState, useCallback } from 'react';
import type { CourseListItem, CourseDetail, CreateCourseForm, UpdateCourseForm, DepartmentOption } from '@/types/admin';
import { COURSE_TYPE_LABELS } from '@/lib/enums';
import {
  fetchCourses, fetchCourseDetail, createCourse, updateCourse, deleteCourse,
  removePrerequisite, deleteCourseInstance, fetchDepartments,
} from '@/lib/courseApi';
import CourseDetailPanel from './CourseDetailPanel';

export default function AdminCourses() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseListItem | null>(null);
  const [viewCourse, setViewCourse] = useState<CourseDetail | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const emptyCreate: CreateCourseForm = {
    name: '', code: '', description: '', creditHours: 3, theoryHours: 2, practicalHours: 2,
    price: undefined, pricePerCreditHour: undefined, courseType: 0, passingGrade: 50,
    departmentIds: [],
    gradeWeights: { midterm: 30, final: 40, practical: 10, quizzes: 10, oral: 10 },
  };
  const [createForm, setCreateForm] = useState<CreateCourseForm>(emptyCreate);
  const [editForm, setEditForm] = useState<UpdateCourseForm>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await fetchCourses({
      departmentId: deptFilter ? Number(deptFilter) : undefined,
      courseType: typeFilter !== '' ? Number(typeFilter) : undefined,
      search: search || undefined,
    });
    setCourses(result.data);
    setLoading(false);
  }, [search, typeFilter, deptFilter]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { fetchDepartments().then(setDepartments); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const res = await createCourse(createForm);
    setSubmitting(false);
    if (res.id !== null) { setToast('Course created'); setShowCreate(false); setCreateForm(emptyCreate); loadData(); }
    else setToast(res.error || 'Create failed');
  };

  const handleOpenEdit = (c: CourseListItem) => {
    setEditCourse(c);
    setEditForm({ name: c.name, code: c.code, description: c.description, creditHours: c.creditHours, theoryHours: c.theoryHours, practicalHours: c.practicalHours, courseType: c.courseType, passingGrade: c.passingGrade });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourse) return;
    setSubmitting(true);
    const res = await updateCourse(editCourse.id, editForm);
    setSubmitting(false);
    if (res.success) { setToast('Course updated'); setEditCourse(null); loadData(); }
    else setToast(res.error || 'Update failed');
  };

  const handleView = async (id: number) => {
    const res = await fetchCourseDetail(id);
    if (res.data) setViewCourse(res.data);
    else setToast(res.error || 'Failed to load details');
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const res = await deleteCourse(deleteId);
    if (res.success) { setToast('Course deleted'); loadData(); }
    else setToast(res.error || 'Delete failed');
    setDeleteId(null);
  };

  const handleRemovePrerequisite = async (prereqId: number) => {
    if (!viewCourse) return;
    const res = await removePrerequisite(viewCourse.id, prereqId);
    if (res.success) {
      setToast('Prerequisite removed');
      const refreshed = await fetchCourseDetail(viewCourse.id);
      if (refreshed.data) setViewCourse(refreshed.data);
    } else setToast(res.error || 'Failed to remove');
  };

  const handleDeleteInstance = async (instanceId: number) => {
    if (!viewCourse) return;
    const res = await deleteCourseInstance(instanceId);
    if (res.success) {
      setToast('Instance deleted');
      const refreshed = await fetchCourseDetail(viewCourse.id);
      if (refreshed.data) setViewCourse(refreshed.data);
      loadData();
    } else setToast(res.error || 'Failed to delete');
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
  const selectCls = 'px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Course Management</h1>
          {!loading && <p className="text-xs text-slate-400 mt-0.5">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>}
        </div>
        <button type="button" onClick={() => { setCreateForm(emptyCreate); setShowCreate(true); }} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"><i className="ri-add-line" /> Add Course</button>
      </div>

      {toast && (<div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2"><i className="ri-check-line" /> {toast}</div>)}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or code..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className={selectCls}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selectCls}>
          <option value="">All Types</option>
          <option value="0">Compulsory</option>
          <option value="1">Elective</option>
        </select>
      </div>

      {loading && (<div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading courses...</div>)}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Course</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Credits</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Theory/Practical</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pass</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Prerequisites</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Depts</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Instances</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div><p className="text-sm font-medium text-slate-700">{c.code} — {c.name}</p><p className="text-[10px] text-slate-400 line-clamp-1">{c.description || 'No description'}</p></div>
                  </td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{c.creditHours}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{c.theoryHours}/{c.practicalHours}</td>
                  <td className="px-5 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${c.courseType === 0 ? 'bg-slate-50 text-slate-600' : 'bg-emerald-50 text-emerald-600'}`}>{COURSE_TYPE_LABELS[c.courseType as 0 | 1]}</span></td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{c.passingGrade}%</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{c.prerequisites?.length ?? '—'}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{c.departments?.length ?? '—'}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-500">—</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => handleView(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500" title="View"><i className="ri-eye-line text-sm" /></button>
                      <button type="button" onClick={() => handleOpenEdit(c)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500" title="Edit"><i className="ri-pencil-line text-sm" /></button>
                      <button type="button" onClick={() => setDeleteId(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500" title="Delete"><i className="ri-delete-bin-line text-sm" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && courses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-book-line text-3xl text-slate-400" /></div>
          <p className="text-sm text-slate-500">No courses found.</p>
        </div>
      )}

      {viewCourse && <CourseDetailPanel course={viewCourse} onClose={() => setViewCourse(null)} onRemovePrerequisite={handleRemovePrerequisite} onDeleteInstance={handleDeleteInstance} />}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Add Course</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Course Name *</label>
                  <input type="text" required value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Code *</label>
                  <input type="text" required value={createForm.code} onChange={e => setCreateForm(p => ({ ...p, code: e.target.value }))} className={inputCls} placeholder="e.g. CS301" /></div>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea value={createForm.description || ''} onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))} rows={2} className={inputCls + ' resize-none'} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Credit Hours *</label>
                  <input type="number" required min={1} max={6} value={createForm.creditHours} onChange={e => setCreateForm(p => ({ ...p, creditHours: Number(e.target.value) }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Theory Hours *</label>
                  <input type="number" required min={0} value={createForm.theoryHours} onChange={e => setCreateForm(p => ({ ...p, theoryHours: Number(e.target.value) }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Practical Hours *</label>
                  <input type="number" required min={0} value={createForm.practicalHours} onChange={e => setCreateForm(p => ({ ...p, practicalHours: Number(e.target.value) }))} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Type *</label>
                  <select value={createForm.courseType} onChange={e => setCreateForm(p => ({ ...p, courseType: Number(e.target.value) }))} className={inputCls}>
                    <option value={0}>Compulsory</option><option value={1}>Elective</option>
                  </select></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Passing Grade *</label>
                  <input type="number" required min={0} max={100} step={0.1} value={createForm.passingGrade} onChange={e => setCreateForm(p => ({ ...p, passingGrade: Number(e.target.value) }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Price</label>
                  <input type="number" min={0} step={0.01} value={createForm.price ?? ''} onChange={e => setCreateForm(p => ({ ...p, price: e.target.value ? Number(e.target.value) : undefined }))} className={inputCls} placeholder="Optional" /></div>
              </div>
              {/* Departments */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Departments *</label>
                <div className="border border-gray-200 rounded-lg p-2 max-h-28 overflow-y-auto space-y-1">
                  {departments.map(d => (
                    <label key={d.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                      <input type="checkbox" checked={createForm.departmentIds.includes(d.id)}
                        onChange={e => setCreateForm(p => ({
                          ...p,
                          departmentIds: e.target.checked
                            ? [...p.departmentIds, d.id]
                            : p.departmentIds.filter(id => id !== d.id)
                        }))}
                        className="rounded border-gray-300" />
                      {d.name}
                    </label>
                  ))}
                  {departments.length === 0 && <p className="text-xs text-slate-400 px-1">No departments available</p>}
                </div>
              </div>
              {/* Grade Weights */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Grade Weights (must sum to 100%)</label>
                <div className="grid grid-cols-5 gap-2">
                  {(['midterm', 'final', 'practical', 'quizzes', 'oral'] as const).map(key => (
                    <div key={key}>
                      <label className="block text-[10px] text-slate-500 mb-1 capitalize">{key}</label>
                      <input type="number" min={0} max={100} value={createForm.gradeWeights[key]}
                        onChange={e => setCreateForm(p => ({ ...p, gradeWeights: { ...p.gradeWeights, [key]: Number(e.target.value) } }))}
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Total: <span className={`font-semibold ${
                    Object.values(createForm.gradeWeights).reduce((a, b) => a + b, 0) === 100
                      ? 'text-emerald-600' : 'text-red-500'
                  }`}>{Object.values(createForm.gradeWeights).reduce((a, b) => a + b, 0)}%</span>
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting || !createForm.name || !createForm.code || createForm.departmentIds.length === 0 || Object.values(createForm.gradeWeights).reduce((a,b)=>a+b,0) !== 100} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Creating...</span> : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Edit Course — {editCourse.code}</h2>
              <button type="button" onClick={() => setEditCourse(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                  <input type="text" value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Code</label>
                  <input type="text" value={editForm.code || ''} onChange={e => setEditForm(p => ({ ...p, code: e.target.value }))} className={inputCls} /></div>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea value={editForm.description || ''} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={2} className={inputCls + ' resize-none'} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Credit Hours</label>
                  <input type="number" min={1} max={6} value={editForm.creditHours ?? ''} onChange={e => setEditForm(p => ({ ...p, creditHours: Number(e.target.value) }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Theory Hours</label>
                  <input type="number" min={0} value={editForm.theoryHours ?? ''} onChange={e => setEditForm(p => ({ ...p, theoryHours: Number(e.target.value) }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Practical Hours</label>
                  <input type="number" min={0} value={editForm.practicalHours ?? ''} onChange={e => setEditForm(p => ({ ...p, practicalHours: Number(e.target.value) }))} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select value={editForm.courseType ?? ''} onChange={e => setEditForm(p => ({ ...p, courseType: Number(e.target.value) }))} className={inputCls}>
                    <option value={0}>Compulsory</option><option value={1}>Elective</option>
                  </select></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Passing Grade</label>
                  <input type="number" min={0} max={100} step={0.1} value={editForm.passingGrade ?? ''} onChange={e => setEditForm(p => ({ ...p, passingGrade: Number(e.target.value) }))} className={inputCls} /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Price</label>
                  <input type="number" min={0} step={0.01} value={editForm.price ?? ''} onChange={e => setEditForm(p => ({ ...p, price: e.target.value ? Number(e.target.value) : undefined }))} className={inputCls} /></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditCourse(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div>
            <h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Course?</h3>
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