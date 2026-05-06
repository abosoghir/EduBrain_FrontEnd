import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  fetchCourseInstances, createCourseInstance, updateCourseInstance, deleteCourseInstance,
  fetchSemesterOptions, fetchDepartmentOptions, fetchDoctorOptions, fetchCourseOptions,
} from '@/lib/adminApi';
import type {
  CourseInstanceListItem, CourseInstanceListParams,
  CreateCourseInstanceForm, UpdateCourseInstanceForm,
  SemesterOption, DepartmentOption, DoctorOption, CourseOption,
  PaginatedResponse,
} from '@/types/admin';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';
const selectCls = 'px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';

const EMPTY_CREATE: CreateCourseInstanceForm = { courseId: 0, semesterId: 0, doctorId: 0, maxCapacity: 30 };

export default function AdminCourseInstances() {
  const [data, setData] = useState<PaginatedResponse<CourseInstanceListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [semesterFilter, setSemesterFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [search, setSearch] = useState('');

  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<CourseInstanceListItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState<CreateCourseInstanceForm>(EMPTY_CREATE);
  const [editForm, setEditForm] = useState<UpdateCourseInstanceForm>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2800); };

  const buildParams = useCallback((): CourseInstanceListParams => ({
    semesterId: semesterFilter ? Number(semesterFilter) : undefined,
    departmentId: departmentFilter ? Number(departmentFilter) : undefined,
    doctorId: doctorFilter ? Number(doctorFilter) : undefined,
    search: search || undefined,
    page, pageSize,
  }), [semesterFilter, departmentFilter, doctorFilter, search, page]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchCourseInstances(buildParams());
    setData(res.data);
    setLoading(false);
  }, [buildParams]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    fetchSemesterOptions().then(setSemesters);
    fetchDepartmentOptions().then(setDepartments);
    fetchDoctorOptions().then(setDoctors);
    fetchCourseOptions().then(setCourses);
  }, []);

  const onSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPage(1), 400);
  };
  const onFilter = (setter: (v: string) => void, val: string) => { setter(val); setPage(1); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const res = await createCourseInstance(createForm);
    setSubmitting(false);
    if (res.id !== null) { showToast('Course instance created'); setShowCreate(false); loadData(); }
    else showToast(res.error || 'Create failed', false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setSubmitting(true);
    const res = await updateCourseInstance(editItem.id, editForm);
    setSubmitting(false);
    if (res.success) { showToast('Instance updated'); setEditItem(null); loadData(); }
    else showToast(res.error || 'Update failed', false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteCourseInstance(deleteId);
    if (res.success) { showToast('Instance deleted'); loadData(); }
    else showToast(res.error || 'Delete failed', false);
    setDeleteId(null);
  };

  const openEdit = (item: CourseInstanceListItem) => {
    setEditItem(item);
    setEditForm({ doctorId: item.doctorId, maxCapacity: item.maxCapacity });
  };

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalCount = data?.totalCount ?? 0;

  const capacityColor = (pct: number) => pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-500';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Course Instances</h1>
          {!loading && <p className="text-xs text-slate-400 mt-0.5">{totalCount} instance{totalCount !== 1 ? 's' : ''} total</p>}
        </div>
        <button type="button" onClick={() => { setCreateForm(EMPTY_CREATE); setShowCreate(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap">
          <i className="ri-add-line" /> Add Instance
        </button>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${toast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <i className={toast.ok ? 'ri-check-line' : 'ri-error-warning-line'} /> {toast.msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Search by course or doctor..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <select value={semesterFilter} onChange={e => onFilter(setSemesterFilter, e.target.value)} className={selectCls}>
          <option value="">All Semesters</option>
          {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={departmentFilter} onChange={e => onFilter(setDepartmentFilter, e.target.value)} className={selectCls}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={doctorFilter} onChange={e => onFilter(setDoctorFilter, e.target.value)} className={selectCls}>
          <option value="">All Doctors</option>
          {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
        </select>
      </div>

      {loading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-4"><i className="ri-loader-4-line animate-spin" /> Loading...</div>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {['Course', 'Semester', 'Doctor', 'Capacity', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`${h === 'Course' ? 'text-left' : 'text-center'} px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => {
                const pct = item.enrollmentPercentage;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-700">{item.courseName}</p>
                      <p className="text-[10px] text-slate-400">{item.courseCode}</p>
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-slate-600">{item.semesterName}</td>
                    <td className="px-5 py-3 text-center text-xs text-slate-600">
                      <p>{item.doctorName}</p>
                      <p className="text-[10px] text-slate-400">{item.doctorTitleDisplay}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-medium text-slate-700">{item.currentEnrolled}/{item.maxCapacity}</span>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${capacityColor(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${item.status === 'Full' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" onClick={() => openEdit(item)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500" title="Edit">
                          <i className="ri-pencil-line text-sm" />
                        </button>
                        <button type="button" onClick={() => setDeleteId(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500" title="Delete">
                          <i className="ri-delete-bin-line text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && items.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-tv-line text-3xl text-slate-400" /></div>
          <p className="text-sm text-slate-500">No course instances found.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-slate-400">Page {page} of {totalPages} · {totalCount} results</p>
          <div className="flex gap-1">
            <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <i className="ri-arrow-left-s-line" /> Previous
            </button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next <i className="ri-arrow-right-s-line" />
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Add Course Instance</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Course *</label>
                <select required value={createForm.courseId || ''} onChange={e => setCreateForm(p => ({ ...p, courseId: Number(e.target.value) }))} className={inputCls}>
                  <option value="">Select course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Semester *</label>
                <select required value={createForm.semesterId || ''} onChange={e => setCreateForm(p => ({ ...p, semesterId: Number(e.target.value) }))} className={inputCls}>
                  <option value="">Select semester...</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Doctor *</label>
                <select required value={createForm.doctorId || ''} onChange={e => setCreateForm(p => ({ ...p, doctorId: Number(e.target.value) }))} className={inputCls}>
                  <option value="">Select doctor...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Max Capacity *</label>
                <input type="number" required min={1} value={createForm.maxCapacity}
                  onChange={e => setCreateForm(p => ({ ...p, maxCapacity: Number(e.target.value) }))} className={inputCls} />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting || !createForm.courseId || !createForm.semesterId || !createForm.doctorId}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Creating...</span> : 'Create Instance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Edit Instance — {editItem.courseCode}</h2>
              <button type="button" onClick={() => setEditItem(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Doctor</label>
                <select value={editForm.doctorId || ''} onChange={e => setEditForm(p => ({ ...p, doctorId: Number(e.target.value) }))} className={inputCls}>
                  <option value="">No change</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Max Capacity</label>
                <input type="number" min={1} value={editForm.maxCapacity ?? editItem.maxCapacity}
                  onChange={e => setEditForm(p => ({ ...p, maxCapacity: Number(e.target.value) }))} className={inputCls} />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Delete Course Instance?</h3>
            <p className="text-xs text-slate-500 mb-5">This will also remove enrolled students from this instance.</p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
