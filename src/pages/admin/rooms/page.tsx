import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { RoomListItem, RoomDetail, CreateRoomForm, UpdateRoomForm } from '@/types/admin';
import { RoomType, ROOM_TYPE_LABELS } from '@/lib/enums';

const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400';
const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

const EMPTY_FORM: CreateRoomForm = {
  name: '', roomType: RoomType.LectureHall, hasProjector: false, hasSmartBoard: false,
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

function unwrapDetail(res: { data: unknown }): RoomDetail | null {
  const d = res.data as ApiResponse<RoomDetail>;
  if (d && 'isSuccess' in d && d.isSuccess && d.hasData && d.data) return d.data;
  return null;
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [minCapacity, setMinCapacity] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateRoomForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [viewRoom, setViewRoom] = useState<RoomDetail | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  const loadData = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (typeFilter !== '') params.set('roomType', typeFilter);
    if (minCapacity) params.set('minCapacity', minCapacity);
    const qs = params.toString() ? `?${params.toString()}` : '';
    api.get<unknown>(`/api/admin/rooms${qs}`)
      .then(res => setRooms(unwrapRooms(res)))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [search, typeFilter, minCapacity]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => rooms, [rooms]); // server-side filtering already applied

  const handleOpenCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setShowModal(true); };
  const handleOpenEdit = (r: RoomListItem) => {
    setEditingId(r.id);
    setForm({ name: r.name, roomType: r.roomType, capacity: r.capacity, location: r.location, hasProjector: r.hasProjector, hasSmartBoard: r.hasSmartBoard });
    setShowModal(true);
  };

  const handleView = async (id: number) => {
    try {
      const res = await api.get<unknown>(`/api/admin/rooms/${id}`);
      const detail = unwrapDetail(res);
      if (detail) setViewRoom(detail);
      else showToast('Failed to load room details', false);
    } catch { showToast('Failed to load room details', false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editingId !== null) {
        const payload: UpdateRoomForm = { ...form };
        const res = await api.put<ApiResponse<boolean>>(`/api/admin/rooms/${editingId}`, payload);
        const d = res.data as ApiResponse<boolean>;
        if (d?.isSuccess) showToast('Room updated');
        else showToast(d?.error?.description || 'Update failed', false);
      } else {
        const res = await api.post<ApiResponse<{ id: number }>>('/api/admin/rooms', form);
        const d = res.data as ApiResponse<{ id: number }>;
        if (d?.isSuccess) showToast('Room created');
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
      if (d?.isSuccess) { showToast('Room deleted'); loadData(); }
      else showToast(d?.error?.description || 'Delete failed', false);
    } catch { showToast('Delete failed', false); }
    setDeleteId(null);
  };

  const sf = (field: keyof CreateRoomForm, value: unknown) => setForm(p => ({ ...p, [field]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Room Management</h1>
          {!loading && <p className="text-xs text-slate-400 mt-0.5">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</p>}
        </div>
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
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or location..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400">
          <option value="">All Types</option>
          <option value={RoomType.Office}>Office</option>
          <option value={RoomType.LectureHall}>Lecture Hall</option>
          <option value={RoomType.Lab}>Lab</option>
          <option value={RoomType.ExamHall}>Exam Hall</option>
        </select>
        <input type="number" min={0} value={minCapacity} onChange={e => setMinCapacity(e.target.value)} placeholder="Min capacity"
          className="w-28 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {['Room Name', 'Location', 'Capacity', 'Type', 'Projector', 'Smart Board', 'Actions'].map(h => (
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
                  <td className="px-5 py-3 text-center text-xs text-slate-600">{r.location || '—'}</td>
                  <td className="px-5 py-3 text-center text-sm font-semibold text-slate-700">{r.capacity}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600">
                      {ROOM_TYPE_LABELS[r.roomType as RoomType] ?? `Type ${r.roomType}`}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {r.hasProjector ? <i className="ri-check-line text-emerald-500" /> : <i className="ri-close-line text-slate-300" />}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {r.hasSmartBoard ? <i className="ri-check-line text-emerald-500" /> : <i className="ri-close-line text-slate-300" />}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => handleView(r.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500" title="View">
                        <i className="ri-eye-line text-sm" />
                      </button>
                      <button type="button" onClick={() => handleOpenEdit(r)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500" title="Edit">
                        <i className="ri-pencil-line text-sm" />
                      </button>
                      <button type="button" onClick={() => setDeleteId(r.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500" title="Delete">
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

      {/* Detail Panel */}
      {viewRoom && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">{viewRoom.name}</h2>
              <button type="button" onClick={() => setViewRoom(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-400">Location</span><p className="text-slate-700 font-medium">{viewRoom.location || '—'}</p></div>
                <div><span className="text-slate-400">Capacity</span><p className="text-slate-700 font-medium">{viewRoom.capacity}</p></div>
                <div><span className="text-slate-400">Type</span><p className="text-slate-700 font-medium">{ROOM_TYPE_LABELS[viewRoom.roomType as RoomType]}</p></div>
                <div><span className="text-slate-400">Equipment</span>
                  <div className="flex gap-2 mt-0.5">
                    {viewRoom.hasProjector && <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-medium">Projector</span>}
                    {viewRoom.hasSmartBoard && <span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 text-[10px] font-medium">Smart Board</span>}
                    {!viewRoom.hasProjector && !viewRoom.hasSmartBoard && <span className="text-slate-400">None</span>}
                  </div>
                </div>
              </div>
              {viewRoom.schedules.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Schedules</h3>
                  <div className="space-y-1.5">{viewRoom.schedules.map(s => (
                    <div key={s.id} className="p-2 bg-gray-50 rounded-lg text-xs">
                      <p className="font-medium text-slate-700">{s.courseCode} — {s.courseName}</p>
                      <p className="text-slate-400">{s.doctorName} · {s.startTime}–{s.endTime}</p>
                    </div>
                  ))}</div>
                </div>
              )}
              {viewRoom.examSchedules.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Exam Schedules</h3>
                  <div className="space-y-1.5">{viewRoom.examSchedules.map(e => (
                    <div key={e.id} className="p-2 bg-gray-50 rounded-lg text-xs">
                      <p className="font-medium text-slate-700">{e.courseCode} — {e.courseName}</p>
                      <p className="text-slate-400">{e.examDate?.split('T')[0]} · {e.startTime}–{e.endTime}</p>
                    </div>
                  ))}</div>
                </div>
              )}
            </div>
          </div>
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
                <input type="text" required value={form.name} onChange={e => sf('name', e.target.value)} placeholder="e.g. Hall A" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input type="text" value={form.location ?? ''} onChange={e => sf('location', e.target.value)} placeholder="e.g. Building 1, Floor 2" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Capacity</label>
                  <input type="number" min={1} value={form.capacity ?? ''} onChange={e => sf('capacity', e.target.value ? Number(e.target.value) : undefined)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Room Type *</label>
                  <select required value={form.roomType} onChange={e => sf('roomType', Number(e.target.value))} className={inputCls}>
                    <option value={RoomType.Office}>Office</option>
                    <option value={RoomType.LectureHall}>Lecture Hall</option>
                    <option value={RoomType.Lab}>Lab</option>
                    <option value={RoomType.ExamHall}>Exam Hall</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={form.hasProjector} onChange={e => sf('hasProjector', e.target.checked)}
                    className="rounded border-gray-300 text-slate-600 focus:ring-slate-400" />
                  Has Projector
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={form.hasSmartBoard} onChange={e => sf('hasSmartBoard', e.target.checked)}
                    className="rounded border-gray-300 text-slate-600 focus:ring-slate-400" />
                  Has Smart Board
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting || !form.name}
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