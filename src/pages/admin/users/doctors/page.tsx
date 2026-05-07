import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { DoctorListItem, DoctorDetail, PaginatedResponse, CreateDoctorForm, UpdateDoctorForm, DepartmentOption } from '@/types/admin';
import { DOCTOR_TITLE_LABELS } from '@/lib/enums';
import { fetchDoctors, fetchDoctorDetail, createDoctor, updateDoctor, deleteDoctor, fetchDepartments } from '@/lib/doctorApi';
import CreateDoctorModal from './CreateDoctorModal';
import EditDoctorModal from './EditDoctorModal';
import DoctorDetailPanel from './DoctorDetailPanel';

const TITLE_OPTIONS = [
  { value: '', label: 'All Titles' },
  { value: '0', label: 'Professor' },
  { value: '1', label: 'Assoc. Prof.' },
  { value: '2', label: 'Asst. Prof.' },
  { value: '3', label: 'Lecturer' },
  { value: '4', label: 'TA' },
];

export default function AdminDoctors() {
  const [data, setData] = useState<PaginatedResponse<DoctorListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [editDoctor, setEditDoctor] = useState<DoctorDetail | null>(null);
  const [viewDoctor, setViewDoctor] = useState<DoctorDetail | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await fetchDoctors({
      searchTerm: searchTerm || undefined,
      departmentId: deptFilter ? Number(deptFilter) : undefined,
      title: titleFilter !== '' ? Number(titleFilter) : undefined,
      page, pageSize,
    });
    setData(result.data);
    setLoading(false);
  }, [searchTerm, deptFilter, titleFilter, page]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { fetchDepartments().then(setDepartments); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const onFilterChange = (setter: (v: string) => void, val: string) => { setter(val); setPage(1); };
  const onSearchChange = (val: string) => {
    setSearchTerm(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPage(1), 400);
  };

  const handleCreate = async (form: CreateDoctorForm) => {
    setSubmitting(true);
    const res = await createDoctor(form);
    setSubmitting(false);
    if (res.success) { setToast('Doctor created successfully'); setShowCreate(false); loadData(); }
    else setToast(res.error || 'Create failed');
  };

  const handleEdit = async (id: number) => {
    const res = await fetchDoctorDetail(id);
    if (res.data) setEditDoctor(res.data);
    else setToast(res.error || 'Failed to load doctor');
  };

  const handleUpdate = async (form: Partial<UpdateDoctorForm>) => {
    if (!editDoctor) return;
    setSubmitting(true);
    const res = await updateDoctor(editDoctor.id, form);
    setSubmitting(false);
    if (res.data) { setToast(res.data.message || 'Doctor updated'); setEditDoctor(null); loadData(); }
    else setToast(res.error || 'Update failed');
  };

  const handleView = async (id: number) => {
    const res = await fetchDoctorDetail(id);
    if (res.data) setViewDoctor(res.data);
    else setToast(res.error || 'Failed to load details');
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const res = await deleteDoctor(deleteId);
    if (res.success) { setToast('Doctor deleted'); loadData(); }
    else setToast(res.error || 'Delete failed');
    setDeleteId(null);
  };

  const doctors = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const selectCls = 'px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Doctor Management</h1>
          {!loading && <p className="text-xs text-slate-400 mt-0.5">{totalCount} doctor{totalCount !== 1 ? 's' : ''} total</p>}
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"><i className="ri-add-line" /> Add Doctor</button>
      </div>

      {toast && (<div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2"><i className="ri-check-line" /> {toast}</div>)}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={searchTerm} onChange={e => onSearchChange(e.target.value)} placeholder="Search by name or code..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <select value={deptFilter} onChange={e => onFilterChange(setDeptFilter, e.target.value)} className={selectCls}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={titleFilter} onChange={e => onFilterChange(setTitleFilter, e.target.value)} className={selectCls}>
          {TITLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading && (<div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading doctors...</div>)}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Specialization</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Courses</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {doctors.map(d => (
                <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-[10px] font-bold text-violet-600 overflow-hidden flex-shrink-0">
                        {d.photoUrl ? <img src={d.photoUrl} alt="" className="w-full h-full object-cover" /> : d.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-slate-700">{d.fullName}</p>
                          {d.isDepartmentHead && <span className="text-[8px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-semibold">HEAD</span>}
                        </div>
                        <p className="text-[10px] text-slate-400">{d.doctorCode} · {d.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center"><span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-50 text-violet-600">{DOCTOR_TITLE_LABELS[d.title as 0|1|2|3|4]}</span></td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{d.departmentName}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{d.specialization || '—'}</td>
                  <td className="px-5 py-3 text-center text-xs font-medium text-slate-700">{d.activeCoursesCount}</td>
                  <td className="px-5 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${d.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-600'}`}>{d.status}</span></td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => handleView(d.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500" title="View"><i className="ri-eye-line text-sm" /></button>
                      <button type="button" onClick={() => handleEdit(d.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500" title="Edit"><i className="ri-pencil-line text-sm" /></button>
                      <button type="button" onClick={() => setDeleteId(d.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500" title="Delete"><i className="ri-delete-bin-line text-sm" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && doctors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-stethoscope-line text-3xl text-slate-400" /></div>
          <p className="text-sm text-slate-500">No doctors found.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-slate-400">Page {page} of {totalPages} · {totalCount} results</p>
          <div className="flex gap-1">
            <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><i className="ri-arrow-left-s-line" /> Previous</button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-slate-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next <i className="ri-arrow-right-s-line" /></button>
          </div>
        </div>
      )}

      {showCreate && <CreateDoctorModal onSubmit={handleCreate} onClose={() => setShowCreate(false)} submitting={submitting} />}
      {editDoctor && <EditDoctorModal doctor={editDoctor} onSubmit={handleUpdate} onClose={() => setEditDoctor(null)} submitting={submitting} />}
      {viewDoctor && <DoctorDetailPanel doctor={viewDoctor} onClose={() => setViewDoctor(null)} />}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div>
            <h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Doctor?</h3>
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