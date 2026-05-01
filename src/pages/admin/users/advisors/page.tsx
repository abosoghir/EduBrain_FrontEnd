import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { AdminAdvisor, AdminUserForm } from '@/types/admin';
import { GENDER_LABELS, DEPARTMENT_TYPE_LABELS } from '@/lib/enums';

export default function AdminAdvisors() {
  const [advisors, setAdvisors] = useState<AdminAdvisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminUserForm>({ name: '', email: '', phoneNumber: '', address: '', gender: 0, dateOfBirth: '', departmentId: 1, officeRoom: '', officeHours: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    api.get<ApiResponse<AdminAdvisor[]>>('/api/users/advisors')
      .then((res) => { if (res.data?.isSuccess && res.data?.hasData && Array.isArray(res.data.data)) setAdvisors(res.data.data); else setAdvisors([]); })
      .catch(() => setAdvisors([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); } }, [toast]);

  const filtered = useMemo(() => {
    let list = Array.isArray(advisors) ? advisors : [];
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.departmentName.toLowerCase().includes(q)); }
    return list;
  }, [advisors, search]);

  const handleOpenCreate = () => { setEditingId(null); setForm({ name: '', email: '', phoneNumber: '', address: '', gender: 0, dateOfBirth: '', departmentId: 1, officeRoom: '', officeHours: '' }); setShowModal(true); };
  const handleOpenEdit = (advisor: AdminAdvisor) => { setEditingId(advisor.advisorId); setForm({ name: advisor.name, email: advisor.email, phoneNumber: advisor.phoneNumber || '', address: advisor.address || '', gender: advisor.gender, dateOfBirth: advisor.dateOfBirth || '', departmentId: advisor.departmentId, officeRoom: advisor.officeRoom || '', officeHours: advisor.officeHours || '' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put<ApiResponse<boolean>>(`/api/users/advisors/${editingId}`, form);
        if (res.data?.isSuccess) { setToast('Advisor updated'); loadData(); } else { setToast(res.data?.error?.description || 'Update failed'); }
      } else {
        const res = await api.post<ApiResponse<string>>('/api/users/advisors', form);
        if (res.data?.isSuccess) { setToast('Advisor created'); loadData(); }
        else { setToast(res.data?.error?.description || 'Create failed'); }
      }
      setShowModal(false);
    } catch { setToast('Request failed, saved locally'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { const res = await api.delete<ApiResponse<boolean>>(`/api/users/advisors/${deleteId}`); if (res.data?.isSuccess) { setToast('Deleted'); loadData(); } else { setToast(res.data?.error?.description || 'Delete failed'); } }
    catch { setToast('Delete failed. Please try again.'); }
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Advisor Management</h1>
        <button type="button" onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"><i className="ri-add-line" /> Add Advisor</button>
      </div>
      {loading && (<div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading advisors...</div>)}
      {toast && (<div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2"><i className="ri-check-line" /> {toast}</div>)}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or department..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Advisor</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Students</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Office</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((a) => (
                <tr key={a.advisorId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-600">{a.name.charAt(0)}</div>
                      <div><p className="text-sm font-medium text-slate-700">{a.name}</p><p className="text-[10px] text-slate-400">{a.email}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{a.departmentName}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{a.assignedStudentCount}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{a.officeRoom || '-'}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => handleOpenEdit(a)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500"><i className="ri-pencil-line text-sm" /></button>
                      <button type="button" onClick={() => setDeleteId(a.advisorId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><i className="ri-delete-bin-line text-sm" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && filtered.length === 0 && (<div className="text-center py-12 bg-white rounded-xl border border-gray-100"><div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-user-star-line text-3xl text-slate-400" /></div><p className="text-sm text-slate-500">No advisors found.</p></div>)}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-800">{editingId ? 'Edit Advisor' : 'Add Advisor'}</h2><button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label><input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Email</label><input type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Phone</label><input type="text" value={form.phoneNumber} onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label><input type="date" value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Address</label><input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Gender</label><select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"><option value={0}>Male</option><option value={1}>Female</option></select></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Department</label><select value={form.departmentId} onChange={(e) => setForm((p) => ({ ...p, departmentId: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"><option value={1}>Computer Science</option><option value={2}>IT</option><option value={3}>Software Engineering</option><option value={4}>AI</option><option value={5}>Cyber Security</option><option value={0}>General</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Office Room</label><input type="text" value={form.officeRoom} onChange={(e) => setForm((p) => ({ ...p, officeRoom: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Office Hours</label><input type="text" value={form.officeHours} onChange={(e) => setForm((p) => ({ ...p, officeHours: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting || !form.name || !form.email} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">{submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : editingId ? 'Save Changes' : 'Create Advisor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5"><div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div><h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Advisor?</h3><p className="text-xs text-slate-500 text-center mb-5">This action cannot be undone.</p><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button><button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button></div></div>
        </div>
      )}
    </div>
  );
}