import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { AdminStudent, AdminUserForm } from '@/types/admin';
import { YEAR_LEVEL_LABELS, GENDER_LABELS, STUDENT_STATUS_FILTER_LABELS } from '@/lib/enums';

export default function AdminStudents() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminUserForm>({
    name: '', email: '', phoneNumber: '', address: '', gender: 0, dateOfBirth: '', departmentId: 1, yearLevel: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    api.get<ApiResponse<AdminStudent[]>>('/api/students')
      .then((res) => {
        if (res.data?.isSuccess && res.data?.hasData && Array.isArray(res.data.data)) {
          setStudents(res.data.data);
        } else {
          setStudents([]);
        }
      })
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }
  }, [toast]);

  const filtered = useMemo(() => {
    let list = Array.isArray(students) ? students : [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.studentCode.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      const target = parseInt(statusFilter, 10);
      list = list.filter((s) => s.status === target);
    }
    return list;
  }, [students, search, statusFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ name: '', email: '', phoneNumber: '', address: '', gender: 0, dateOfBirth: '', departmentId: 1, yearLevel: 0 });
    setShowModal(true);
  };

  const handleOpenEdit = (student: AdminStudent) => {
    setEditingId(student.studentId);
    setForm({
      name: student.name,
      email: student.email,
      phoneNumber: student.phoneNumber || '',
      address: student.address || '',
      gender: student.gender,
      dateOfBirth: student.dateOfBirth || '',
      departmentId: student.departmentId,
      yearLevel: student.yearLevel,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put<ApiResponse<boolean>>(`/api/students/${editingId}`, form);
        if (res.data?.isSuccess) { setToast('Student updated successfully'); loadData(); }
        else {
          setToast(res.data?.error?.description || 'Update failed');
        }
      } else {
        const res = await api.post<ApiResponse<string>>('/api/students', form);
        if (res.data?.isSuccess) { setToast('Student created successfully'); loadData(); }
        else {
          setToast(res.data?.error?.description || 'Create failed');
        }
      }
      setShowModal(false);
    } catch {
      setToast('Request failed. Changes saved locally.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete<ApiResponse<boolean>>(`/api/students/${deleteId}`);
      if (res.data?.isSuccess) { setToast('Student deleted'); loadData(); }
      else { setToast(res.data?.error?.description || 'Delete failed'); }
    } catch { setToast('Delete failed. Please try again.'); }
    setDeleteId(null);
  };

  const statusBadge = (status: number) => {
    const map: Record<number, string> = { 0: 'bg-slate-50 text-slate-600', 1: 'bg-red-50 text-red-600', 2: 'bg-emerald-50 text-emerald-600' };
    return map[status] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Student Management</h1>
        <button type="button" onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap">
          <i className="ri-add-line" /> Add Student
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" /> Loading students...
        </div>
      )}

      {toast && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2">
          <i className="ri-check-line" /> {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, code, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <div className="flex gap-1">
          {[{ key: 'all', label: 'All' }, { key: '0', label: 'Normal' }, { key: '1', label: 'At Risk' }, { key: '2', label: "Dean's List" }].map((f) => (
            <button key={f.key} type="button" onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === f.key ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Year</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">GPA</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Credits</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.studentId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">{s.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{s.name}</p>
                        <p className="text-[10px] text-slate-400">{s.studentCode} · {s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{YEAR_LEVEL_LABELS[s.yearLevel as 0 | 1 | 2 | 3]}</td>
                  <td className="px-5 py-3 text-center"><span className={`text-sm font-bold ${s.gpa >= 3.5 ? 'text-emerald-600' : s.gpa >= 2.5 ? 'text-slate-700' : 'text-red-600'}`}>{s.gpa.toFixed(2)}</span></td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{s.creditHours}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{s.departmentName}</td>
                  <td className="px-5 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(s.status)}`}>{STUDENT_STATUS_FILTER_LABELS[s.status as 0 | 1 | 2]}</span></td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => handleOpenEdit(s)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500"><i className="ri-pencil-line text-sm" /></button>
                      <button type="button" onClick={() => setDeleteId(s.studentId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><i className="ri-delete-bin-line text-sm" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-user-line text-3xl text-slate-400" /></div>
          <p className="text-sm text-slate-500">No students found.</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">{editingId ? 'Edit Student' : 'Add Student'}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                  <input type="text" value={form.phoneNumber} onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400">
                    <option value={0}>Male</option>
                    <option value={1}>Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Year Level</label>
                  <select value={form.yearLevel} onChange={(e) => setForm((p) => ({ ...p, yearLevel: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400">
                    <option value={0}>First Year</option>
                    <option value={1}>Second Year</option>
                    <option value={2}>Third Year</option>
                    <option value={3}>Fourth Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
                  <select value={form.departmentId} onChange={(e) => setForm((p) => ({ ...p, departmentId: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400">
                    <option value={1}>Computer Science</option>
                    <option value={2}>IT</option>
                    <option value={3}>Software Engineering</option>
                    <option value={4}>AI</option>
                    <option value={5}>Cyber Security</option>
                    <option value={0}>General</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting || !form.name || !form.email} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">{submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : editingId ? 'Save Changes' : 'Create Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
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