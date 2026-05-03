import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { StudentListItem, StudentDetail, PaginatedResponse, CreateStudentForm, UpdateStudentForm, DepartmentOption } from '@/types/admin';
import { YEAR_LEVEL_LABELS } from '@/lib/enums';
import { fetchStudents, fetchStudentDetail, createStudent, updateStudent, deleteStudent, fetchDepartments } from '@/lib/studentApi';
import CreateStudentModal from './CreateStudentModal';
import EditStudentModal from './EditStudentModal';
import StudentDetailPanel from './StudentDetailPanel';

const ENROLLMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: '0', label: 'Enrolled' },
  { value: '1', label: 'Waitlisted' },
  { value: '2', label: 'Dropped' },
  { value: '3', label: 'Completed' },
  { value: '4', label: 'Failed' },
];

const YEAR_OPTIONS = [
  { value: '', label: 'All Years' },
  { value: '0', label: 'Freshman' },
  { value: '1', label: 'Sophomore' },
  { value: '2', label: 'Junior' },
  { value: '3', label: 'Senior' },
];

export default function AdminStudents() {
  // List state
  const [data, setData] = useState<PaginatedResponse<StudentListItem> | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Dropdown data
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editStudent, setEditStudent] = useState<StudentDetail | null>(null);
  const [viewStudent, setViewStudent] = useState<StudentDetail | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Search debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = {
      searchTerm: searchTerm || undefined,
      year: yearFilter ? Number(yearFilter) : undefined,
      departmentId: deptFilter ? Number(deptFilter) : undefined,
      status: statusFilter !== '' ? Number(statusFilter) : undefined,
      page,
      pageSize,
    };
    const result = await fetchStudents(params);
    setData(result.data);
    setLoading(false);
  }, [searchTerm, statusFilter, yearFilter, deptFilter, page]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { fetchDepartments().then(setDepartments); }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  // Reset page when filters change
  const onFilterChange = (setter: (v: string) => void, val: string) => { setter(val); setPage(1); };

  const onSearchChange = (val: string) => {
    setSearchTerm(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPage(1), 400);
  };

  const handleCreate = async (form: CreateStudentForm) => {
    setSubmitting(true);
    const res = await createStudent(form);
    setSubmitting(false);
    if (res.data) {
      setToast(`Student created! Code: ${res.data.studentCode}, Temp Password: ${res.data.temporaryPassword}`);
      setShowCreate(false);
      loadData();
    } else {
      setToast(res.error || 'Create failed');
    }
  };

  const handleEdit = async (id: number) => {
    const res = await fetchStudentDetail(id);
    if (res.data) setEditStudent(res.data);
    else setToast(res.error || 'Failed to load student');
  };

  const handleUpdate = async (form: Partial<UpdateStudentForm>) => {
    if (!editStudent) return;
    setSubmitting(true);
    const res = await updateStudent(editStudent.id, form);
    setSubmitting(false);
    if (res.data) {
      setToast(res.data.message || 'Student updated');
      setEditStudent(null);
      loadData();
    } else {
      setToast(res.error || 'Update failed');
    }
  };

  const handleView = async (id: number) => {
    const res = await fetchStudentDetail(id);
    if (res.data) setViewStudent(res.data);
    else setToast(res.error || 'Failed to load details');
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const res = await deleteStudent(deleteId);
    if (res.success) { setToast('Student deleted'); loadData(); }
    else setToast(res.error || 'Delete failed');
    setDeleteId(null);
  };

  const students = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalCount = data?.totalCount ?? 0;

  const statusBadgeCls = (status: string) => {
    const m: Record<string, string> = { Enrolled: 'bg-emerald-50 text-emerald-600', Waitlisted: 'bg-amber-50 text-amber-600', Dropped: 'bg-red-50 text-red-600', Completed: 'bg-blue-50 text-blue-600', Failed: 'bg-red-50 text-red-700' };
    return m[status] || 'bg-gray-50 text-gray-600';
  };

  const selectCls = 'px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Student Management</h1>
          {!loading && <p className="text-xs text-slate-400 mt-0.5">{totalCount} student{totalCount !== 1 ? 's' : ''} total</p>}
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap">
          <i className="ri-add-line" /> Add Student
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2">
          <i className="ri-check-line" /> {toast}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search by name or code..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <select value={yearFilter} onChange={(e) => onFilterChange(setYearFilter, e.target.value)} className={selectCls}>
          {YEAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={deptFilter} onChange={(e) => onFilterChange(setDeptFilter, e.target.value)} className={selectCls}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.description}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => onFilterChange(setStatusFilter, e.target.value)} className={selectCls}>
          {ENROLLMENT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" /> Loading students...
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Year</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">GPA</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Advisor</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 overflow-hidden flex-shrink-0">
                        {s.photoUrl ? <img src={s.photoUrl} alt="" className="w-full h-full object-cover" /> : s.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{s.fullName}</p>
                        <p className="text-[10px] text-slate-400">{s.studentCode} · {s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{YEAR_LEVEL_LABELS[s.yearLevel as 0|1|2|3]}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{s.departmentName}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-sm font-bold ${s.cumulativeGPA >= 3.5 ? 'text-emerald-600' : s.cumulativeGPA >= 2.5 ? 'text-slate-700' : 'text-red-600'}`}>
                      {s.cumulativeGPA?.toFixed(2) ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadgeCls(s.status)}`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{s.academicAdvisorName || '—'}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => handleView(s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500" title="View Details"><i className="ri-eye-line text-sm" /></button>
                      <button type="button" onClick={() => handleEdit(s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500" title="Edit"><i className="ri-pencil-line text-sm" /></button>
                      <button type="button" onClick={() => setDeleteId(s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500" title="Delete"><i className="ri-delete-bin-line text-sm" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {!loading && students.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-user-line text-3xl text-slate-400" /></div>
          <p className="text-sm text-slate-500">No students found.</p>
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

      {/* Modals */}
      {showCreate && <CreateStudentModal onSubmit={handleCreate} onClose={() => setShowCreate(false)} submitting={submitting} />}
      {editStudent && <EditStudentModal student={editStudent} onSubmit={handleUpdate} onClose={() => setEditStudent(null)} submitting={submitting} />}
      {viewStudent && <StudentDetailPanel student={viewStudent} onClose={() => setViewStudent(null)} />}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div>
            <h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Student?</h3>
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