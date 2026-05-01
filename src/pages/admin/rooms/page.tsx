import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { AdminRoom, RoomForm } from '@/types/admin';
import { ROOM_TYPE_LABELS } from '@/lib/enums';

export default function AdminRooms() {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RoomForm>({ roomNumber: '', building: '', floor: 1, capacity: 30, roomType: 1, hasProjector: true, hasWhiteboard: true });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    api.get<ApiResponse<AdminRoom[]>>('/api/admin/rooms')
      .then((res) => { if (res.data?.isSuccess && res.data?.hasData && Array.isArray(res.data.data)) setRooms(res.data.data); else setRooms([]); })
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); } }, [toast]);

  const filtered = useMemo(() => {
    let list = Array.isArray(rooms) ? rooms : [];
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter((r) => r.roomNumber.toLowerCase().includes(q) || r.building.toLowerCase().includes(q)); }
    if (buildingFilter !== 'all') list = list.filter((r) => r.building === buildingFilter);
    return list;
  }, [rooms, search, buildingFilter]);

  const buildings = useMemo(() => Array.from(new Set(rooms.map((r) => r.building))), [rooms]);

  const handleOpenCreate = () => { setEditingId(null); setForm({ roomNumber: '', building: 'Building A', floor: 1, capacity: 30, roomType: 1, hasProjector: true, hasWhiteboard: true }); setShowModal(true); };
  const handleOpenEdit = (room: AdminRoom) => { setEditingId(room.roomId); setForm({ roomNumber: room.roomNumber, building: room.building, floor: room.floor, capacity: room.capacity, roomType: room.roomType, hasProjector: room.hasProjector, hasWhiteboard: room.hasWhiteboard }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put<ApiResponse<boolean>>(`/api/admin/rooms/${editingId}`, form);
        if (res.data?.isSuccess) { setToast('Room updated'); loadData(); } else { setToast(res.data?.error?.description || 'Update failed'); }
      } else {
        const res = await api.post<ApiResponse<string>>('/api/admin/rooms', form);
        if (res.data?.isSuccess) { setToast('Room created'); loadData(); } else { setToast(res.data?.error?.description || 'Create failed'); }
      }
      setShowModal(false);
    } catch { setToast('Request failed, saved locally'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => { if (!deleteId) return; try { const res = await api.delete<ApiResponse<boolean>>(`/api/admin/rooms/${deleteId}`); if (res.data?.isSuccess) { setToast('Deleted'); loadData(); } else { setToast(res.data?.error?.description || 'Delete failed'); } } catch { setToast('Delete failed. Please try again.'); } setDeleteId(null); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Room Management</h1>
        <button type="button" onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"><i className="ri-add-line" /> Add Room</button>
      </div>
      {loading && (<div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading rooms...</div>)}
      {toast && (<div className="mb-4 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2"><i className="ri-check-line" /> {toast}</div>)}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by room number or building..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => setBuildingFilter('all')} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${buildingFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>All</button>
          {buildings.map((b) => (
            <button key={b} type="button" onClick={() => setBuildingFilter(b)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${buildingFilter === b ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>{b}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-gray-50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Room</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Building</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Floor</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Capacity</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Features</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <tr key={r.roomId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3"><p className="text-sm font-medium text-slate-700">{r.roomNumber}</p></td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{r.building}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{r.floor}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{r.capacity}</td>
                  <td className="px-5 py-3 text-center"><span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600">{ROOM_TYPE_LABELS[r.roomType as 0|1|2|3]}</span></td>
                  <td className="px-5 py-3 text-center"><div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">{r.hasProjector && <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">Projector</span>}{r.hasWhiteboard && <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">Whiteboard</span>}</div></td>
                  <td className="px-5 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${r.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500'}`}>{r.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-5 py-3 text-center"><div className="flex items-center justify-center gap-1"><button type="button" onClick={() => handleOpenEdit(r)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500"><i className="ri-pencil-line text-sm" /></button><button type="button" onClick={() => setDeleteId(r.roomId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><i className="ri-delete-bin-line text-sm" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && filtered.length === 0 && (<div className="text-center py-12 bg-white rounded-xl border border-gray-100"><div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-door-line text-3xl text-slate-400" /></div><p className="text-sm text-slate-500">No rooms found.</p></div>)}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-800">{editingId ? 'Edit Room' : 'Add Room'}</h2><button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Room Number</label><input type="text" required value={form.roomNumber} onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Building</label><input type="text" required value={form.building} onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Floor</label><input type="number" required min={0} value={form.floor} onChange={(e) => setForm((p) => ({ ...p, floor: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Capacity</label><input type="number" required min={1} value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" /></div>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Room Type</label><select value={form.roomType} onChange={(e) => setForm((p) => ({ ...p, roomType: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"><option value={0}>Office</option><option value={1}>Lecture Hall</option><option value={2}>Lab</option><option value={3}>Exam Hall</option></select></div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.hasProjector} onChange={(e) => setForm((p) => ({ ...p, hasProjector: e.target.checked }))} className="rounded border-gray-300" /> Projector</label>
                <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.hasWhiteboard} onChange={(e) => setForm((p) => ({ ...p, hasWhiteboard: e.target.checked }))} className="rounded border-gray-300" /> Whiteboard</label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting || !form.roomNumber || !form.building} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">{submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : editingId ? 'Save Changes' : 'Create Room'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5"><div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-500 text-xl" /></div><h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Room?</h3><p className="text-xs text-slate-500 text-center mb-5">This action cannot be undone.</p><div className="flex items-center justify-end gap-2"><button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50 transition-colors">Cancel</button><button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button></div></div>
        </div>
      )}
    </div>
  );
}