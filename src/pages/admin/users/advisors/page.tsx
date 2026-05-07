import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { AdvisorListItem, AdvisorDetail, PaginatedResponse, CreateAdvisorForm, UpdateAdvisorForm } from '@/types/admin';
import { fetchAdvisors, fetchAdvisorDetail, createAdvisor, updateAdvisor, deleteAdvisor } from '@/lib/advisorApi';
import CreateAdvisorModal from './CreateAdvisorModal';
import EditAdvisorModal from './EditAdvisorModal';
import AdvisorDetailPanel from './AdvisorDetailPanel';

export default function AdminAdvisors() {
  const [data, setData] = useState<PaginatedResponse<AdvisorListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showCreate, setShowCreate] = useState(false);
  const [editAdvisor, setEditAdvisor] = useState<AdvisorDetail | null>(null);
  const [viewAdvisor, setViewAdvisor] = useState<AdvisorDetail | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdvisors({
      searchTerm: searchTerm || undefined,
      page, pageSize,
    });
    setData(result.data);
    setLoading(false);
  }, [searchTerm, page]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const onSearchChange = (val: string) => {
    setSearchTerm(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPage(1), 400);
  };

  const handleCreate = async (form: CreateAdvisorForm) => {
    setSubmitting(true);
    const res = await createAdvisor(form);
    setSubmitting(false);
    if (res.success) { setToast('Advisor created successfully'); setShowCreate(false); loadData(); }
    else setToast(res.error || 'Create failed');
  };

  const handleEdit = async (id: number) => {
    const res = await fetchAdvisorDetail(id);
    if (res.data) setEditAdvisor(res.data);
    else setToast(res.error || 'Failed to load advisor');
  };

  const handleUpdate = async (form: UpdateAdvisorForm) => {
    if (!editAdvisor) return;
    setSubmitting(true);
    const res = await updateAdvisor(editAdvisor.id, form);
    setSubmitting(false);
    if (res.success) { setToast('Advisor updated successfully'); setEditAdvisor(null); loadData(); }
    else setToast(res.error || 'Update failed');
  };

  const handleView = async (id: number) => {
    const res = await fetchAdvisorDetail(id);
    if (res.data) setViewAdvisor(res.data);
    else setToast(res.error || 'Failed to load details');
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const res = await deleteAdvisor(deleteId);
    if (res.success) { setToast('Advisor deleted'); loadData(); }
    else setToast(res.error || 'Delete failed');
    setDeleteId(null);
  };

  const advisors = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalCount = data?.totalCount ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Advisor Management</h1>
          {!loading && <p className="text-xs text-slate-400 mt-0.5">{totalCount} advisor{totalCount !== 1 ? 's' : ''} total</p>}
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"><i className="ri-add-line" /> Add Advisor</button>
      </div>

      {toast && (<div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2"><i className="ri-check-line" /> {toast}</div>)}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={searchTerm} onChange={e => onSearchChange(e.target.value)} placeholder="Search by name or code..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
      </div>

      {loading && (<div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading advisors...</div>)}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Advisor</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Office</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Students</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {advisors.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-600 overflow-hidden flex-shrink-0">
                        {a.photoUrl ? <img src={a.photoUrl} alt="" className="w-full h-full object-cover" /> : a.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{a.fullName}</p>
                        <p className="text-[10px] text-slate-400">{a.advisorCode} · {a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{a.officeRoom || '—'}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                      <i className="ri-user-line text-[10px]" /> {a.assignedStudentsCount}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => handleView(a.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500" title="View"><i className="ri-eye-line text-sm" /></button>
                      <button type="button" onClick={() => handleEdit(a.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500" title="Edit"><i className="ri-pencil-line text-sm" /></button>
                      <button type="button" onClick={() => setDeleteId(a.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500" title="Delete"><i className="ri-delete-bin-line text-sm" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && advisors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-user-star-line text-3xl text-slate-400" /></div>
          <p className="text-sm text-slate-500">No advisors found.</p>
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

      {showCreate && <CreateAdvisorModal onSubmit={handleCreate} onClose={() => setShowCreate(false)} submitting={submitting} />}
      {editAdvisor && <EditAdvisorModal advisor={editAdvisor} onSubmit={handleUpdate} onClose={() => setEditAdvisor(null)} submitting={submitting} />}
      {viewAdvisor && <AdvisorDetailPanel advisor={viewAdvisor} onClose={() => setViewAdvisor(null)} />}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div>
            <h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Advisor?</h3>
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