import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { RoomListItem, CreateRoomForm, UpdateRoomForm } from '@/types/admin';
import { RoomType, ROOM_TYPE_LABELS } from '@/lib/enums';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

const EMPTY_FORM: CreateRoomForm = {
  name: '', roomType: RoomType.LectureHall, building: '', floor: 1, capacity: 30,
};

function unwrapRooms(res: { data: unknown }): RoomListItem[] {
  const d = res.data as ApiResponse<RoomListItem[]>;
  if (d && 'isSuccess' in d && d.isSuccess && d.hasData && Array.isArray(d.data)) return d.data as RoomListItem[];
  const raw = res.data as { data?: RoomListItem[]; items?: RoomListItem[] };
  if (raw?.items && Array.isArray(raw.items)) return raw.items;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(res.data)) return res.data as RoomListItem[];
  return [];
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateRoomForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  const loadData = useCallback(() => {
    setLoading(true);
    api.get<unknown>('/api/admin/rooms')
      .then(res => setRooms(unwrapRooms(res)))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    let list = rooms;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.building.toLowerCase().includes(q));
    }
    if (typeFilter !== '') list = list.filter(r => r.roomType === Number(typeFilter));
    if (buildingFilter) list = list.filter(r => r.building === buildingFilter);
    return list;
  }, [rooms, search, typeFilter, buildingFilter]);

  const buildings = useMemo(() => Array.from(new Set(rooms.map(r => r.building).filter(Boolean))), [rooms]);

  const handleOpenCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setShowModal(true); };
  const handleOpenEdit = (r: RoomListItem) => {
    setEditingId(r.id);
    setForm({ name: r.name, roomType: r.roomType, building: r.building, floor: r.floor, capacity: r.capacity });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editingId !== null) {
        const payload: UpdateRoomForm = { ...form };
        const res = await api.put<ApiResponse<boolean>>(`/api/admin/rooms/${editingId}`, payload);
        const d = res.data as ApiResponse<boolean>;
        const raw = res.data as unknown as { success?: boolean };
        if (d?.isSuccess || raw?.success) showToast('Room updated');
        else showToast(d?.error?.description || 'Update failed', false);
      } else {
        const res = await api.post<ApiResponse<{ id: number }>>('/api/admin/rooms', form);
        const d = res.data as ApiResponse<{ id: number }>;
        const raw = res.data as unknown as { success?: boolean };
        if (d?.isSuccess || raw?.success) showToast('Room created');
        else showToast(d?.error?.description || 'Create failed', false);
      }
      setShowModal(false); loadData();
    } catch { showToast('Request failed', false); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      const res = await api.delete<ApiResponse<boolean>>(`/api/admin/rooms/${deleteId}`);
      const d = res.data as ApiResponse<boolean>;
      const raw = res.data as unknown as { success?: boolean };
      if (d?.isSuccess || raw?.success) { showToast('Room deleted'); loadData(); }
      else showToast(d?.error?.description || 'Delete failed', false);
    } catch { showToast('Delete failed', false); }
    setDeleteId(null);
  };

  const sf = (field: keyof CreateRoomForm, value: unknown) => setForm(p => ({ ...p, [field]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Room Management</h1>
        <button type="button" onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap">
          <i className="ri-add-line" /> Add Room
        </button>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${toast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <i className={toast.ok ? 'ri-check-line' : 'ri-error-warning-line'} /> {toast.msg}
        </div>
      )}

      {loading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-6"><i className="ri-loader-4-line animate-spin" /> Loading rooms...</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by room name or building..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400">
          <option value="">All Types</option>
          <option value={RoomType.LectureHall}>Lecture Hall</option>
          <option value={RoomType.Lab}>Lab</option>
          <option value={RoomType.Office}>Office</option>
        </select>
        <select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400">
          <option value="">All Buildings</option>
          {buildings.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {['Room Name', 'Building', 'Floor', 'Capacity', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`${h === 'Room Name' ? 'text-left' : 'text-center'} px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-700">{r.name}</p>
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{r.building || '—'}</td>
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{r.floor ?? '—'}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{r.capacity}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600">
                      {ROOM_TYPE_LABELS[r.roomType as RoomType] ?? r.roomTypeDisplay}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${r.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500'}`}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => handleOpenEdit(r)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500">
                        <i className="ri-pencil-line text-sm" />
                      </button>
                      <button type="button" onClick={() => setDeleteId(r.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500">
                        <i className="ri-delete-bin-line text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-door-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No rooms found.</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">{editingId !== null ? 'Edit Room' : 'Add Room'}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600">
                <i className="ri-close-line" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Room Name *</label>
                <input type="text" required value={form.name} onChange={e => sf('name', e.target.value)} placeholder="e.g. A-101" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Building</label>
                  <input type="text" value={form.building} onChange={e => sf('building', e.target.value)} placeholder="e.g. Building A" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Floor</label>
                  <input type="number" min={0} value={form.floor ?? ''} onChange={e => sf('floor', e.target.value ? Number(e.target.value) : undefined)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Capacity *</label>
                  <input type="number" required min={1} value={form.capacity} onChange={e => sf('capacity', Number(e.target.value))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Room Type *</label>
                  <select required value={form.roomType} onChange={e => sf('roomType', Number(e.target.value))} className={inputCls}>
                    <option value={RoomType.LectureHall}>Lecture Hall</option>
                    <option value={RoomType.Lab}>Lab</option>
                    <option value={RoomType.Office}>Office</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting || !form.name || !form.capacity}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors">
                  {submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : editingId !== null ? 'Save Changes' : 'Create Room'}
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
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-xl" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Delete Room?</h3>
            <p className="text-xs text-slate-500 mb-5">This action cannot be undone.</p>
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