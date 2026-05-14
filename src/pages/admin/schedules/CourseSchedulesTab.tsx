import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchCourseSchedules, createCourseSchedule, updateCourseSchedule, deleteCourseSchedule, fetchSemesters, fetchDoctorsDropdown, fetchRoomsDropdown, fetchDepartmentsDropdown, fetchWeeklyTimetable, fetchCourseInstancesDropdown } from '@/lib/scheduleApi';
import type { CourseScheduleItem, CourseScheduleFilterParams, CreateCourseScheduleForm, UpdateCourseScheduleForm, SemesterOption, DoctorOption, RoomOption, DepartmentOption, TimetableBlock, CourseInstanceDropdownItem } from '@/types/admin';
import { SCHEDULE_TYPE_LABELS } from '@/lib/enums';
import WeeklyScheduleGrid from './WeeklyScheduleGrid';

const TIME_PRESETS = [
  { label: '8-10', start: '08:00:00', end: '10:00:00' },
  { label: '10-12', start: '10:00:00', end: '12:00:00' },
  { label: '12-2', start: '12:00:00', end: '14:00:00' },
  { label: '2-4', start: '14:00:00', end: '16:00:00' },
  { label: '4-6', start: '16:00:00', end: '18:00:00' },
  { label: '6-8', start: '18:00:00', end: '20:00:00' },
];

type ViewMode = 'table' | 'grid';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function CourseSchedulesTab() {
  const [schedules, setSchedules] = useState<CourseScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CourseScheduleFilterParams>({});
  const [search, setSearch] = useState('');
  const [dayFilter, setDayFilter] = useState<string>('all');

  const [semesters, setSemesters] = useState<SemesterOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CourseScheduleItem | null>(null);
  const [form, setForm] = useState<CreateCourseScheduleForm>({ courseInstanceId: 0, day: 0, startTime: '09:00:00', endTime: '11:00:00', type: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [timetableBlocks, setTimetableBlocks] = useState<TimetableBlock[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [courseInstances, setCourseInstances] = useState<CourseInstanceDropdownItem[]>([]);
  const [ciSearch, setCiSearch] = useState('');
  const [selectedCi, setSelectedCi] = useState<CourseInstanceDropdownItem | null>(null);

  const loadDropdowns = useCallback(async () => {
    const [s, doc, r, dep, ci] = await Promise.all([fetchSemesters(), fetchDoctorsDropdown(), fetchRoomsDropdown(), fetchDepartmentsDropdown(), fetchCourseInstancesDropdown()]);
    setSemesters(s); setDoctors(doc); setRooms(r); setDepartments(dep); setCourseInstances(ci);
  }, []);

  // Reload course instances when semester filter changes
  useEffect(() => {
    fetchCourseInstancesDropdown(filters.semesterId).then(setCourseInstances);
  }, [filters.semesterId]);

  const loadTimetable = useCallback(async () => {
    setTimetableLoading(true);
    const res = await fetchWeeklyTimetable({
      semesterId: filters.semesterId,
      departmentId: filters.departmentId,
      doctorId: filters.doctorId,
      roomId: filters.roomId,
    });
    setTimetableBlocks(res.data?.blocks ?? []);
    if (res.error) setToast({ msg: res.error, type: 'error' });
    setTimetableLoading(false);
  }, [filters]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const params: CourseScheduleFilterParams = { ...filters };
    if (dayFilter !== 'all') params.day = Number(dayFilter);
    const res = await fetchCourseSchedules(params);
    setSchedules(res.data ?? []);
    if (res.error) setToast({ msg: res.error, type: 'error' });
    setLoading(false);
  }, [filters, dayFilter]);

  useEffect(() => { loadDropdowns(); }, [loadDropdowns]);
  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (viewMode === 'grid') loadTimetable(); }, [viewMode, loadTimetable]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toast]);

  const filtered = useMemo(() => {
    if (!search.trim()) return schedules;
    const q = search.toLowerCase();
    return schedules.filter(s => s.courseName.toLowerCase().includes(q) || s.courseCode.toLowerCase().includes(q) || s.doctorName.toLowerCase().includes(q));
  }, [schedules, search]);

  // Get suggested duration (hours) based on schedule type and course data
  const getSuggestedDuration = (ci: CourseInstanceDropdownItem | null, type: number): number => {
    if (!ci) return 2;
    if (type === 1) return ci.practicalHours > 0 ? ci.practicalHours : 2; // Lab
    return ci.theoryHours > 0 ? ci.theoryHours : 2; // Lecture/Tutorial
  };

  const computeEndTime = (startTime: string, durationHours: number): string => {
    const [h] = startTime.split(':').map(Number);
    const endH = Math.min(h + durationHours, 20);
    return `${String(endH).padStart(2, '0')}:00:00`;
  };

  const handleOpenCreate = (prefillDay?: number, prefillHour?: number) => {
    setEditingItem(null);
    setSelectedCi(null);
    const start = prefillHour !== undefined ? `${String(prefillHour).padStart(2,'0')}:00:00` : '09:00:00';
    const endH = prefillHour !== undefined ? Math.min(prefillHour + 2, 20) : 11;
    const end = `${String(endH).padStart(2,'0')}:00:00`;
    setForm({ courseInstanceId: 0, day: prefillDay ?? 0, startTime: start, endTime: end, type: 0 });
    setCiSearch('');
    setShowModal(true);
  };

  const handleOpenEdit = (s: CourseScheduleItem) => {
    setEditingItem(s);
    setSelectedCi(courseInstances.find(ci => ci.id === s.courseInstanceId) ?? null);
    setForm({ courseInstanceId: s.courseInstanceId, day: s.day, startTime: s.startTime, endTime: s.endTime, type: s.type, roomId: s.roomId });
    setShowModal(true);
  };

  const handleSelectCourseInstance = (ci: CourseInstanceDropdownItem) => {
    const dur = getSuggestedDuration(ci, form.type);
    const endTime = computeEndTime(form.startTime, dur);
    setForm(p => ({ ...p, courseInstanceId: ci.id, endTime }));
    setCiSearch(ci.label);
    setSelectedCi(ci);
  };

  const handleTypeChange = (newType: number) => {
    const dur = getSuggestedDuration(selectedCi, newType);
    const endTime = computeEndTime(form.startTime, dur);
    setForm(p => ({ ...p, type: newType, endTime }));
  };

  const handleBlockClick = (block: TimetableBlock) => {
    const asSchedule: CourseScheduleItem = { ...block, roomBuilding: null, doctorTitle: 0, departmentId: 0, departmentName: block.departmentName, gridRow: block.gridRow, gridColumn: block.gridColumn, durationInHours: block.rowSpan };
    handleOpenEdit(asSchedule);
  };

  const handleSlotClick = (day: number, hour: number) => handleOpenCreate(day, hour);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        const updateForm: UpdateCourseScheduleForm = { day: form.day, startTime: form.startTime, endTime: form.endTime, type: form.type, roomId: form.roomId };
        const res = await updateCourseSchedule(editingItem.scheduleId, updateForm);
        if (res.data) { setToast({ msg: res.data.message || 'Schedule updated', type: 'success' }); loadData(); loadTimetable(); }
        else setToast({ msg: res.error || 'Update failed', type: 'error' });
      } else {
        if (!form.courseInstanceId) { setToast({ msg: 'Course Instance is required', type: 'error' }); setSubmitting(false); return; }
        const res = await createCourseSchedule(form);
        if (res.data) {
          const msg = res.data.hasConflict ? `Created with conflict: ${res.data.conflictMessage}` : 'Schedule created';
          setToast({ msg, type: res.data.hasConflict ? 'error' : 'success' });
          loadData(); loadTimetable();
        } else setToast({ msg: res.error || 'Create failed', type: 'error' });
      }
      setShowModal(false);
    } catch { setToast({ msg: 'Request failed', type: 'error' }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    const res = await deleteCourseSchedule(deleteId);
    if (res.success) { setToast({ msg: 'Schedule deleted', type: 'success' }); loadData(); loadTimetable(); }
    else setToast({ msg: res.error || 'Delete failed', type: 'error' });
    setDeleteId(null);
  };

  const fmtTime = (t: string) => t?.slice(0, 5) || t;

  return (
    <div>
      {/* Toast */}
      {toast && (<div className={`mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}><i className={`ri-${toast.type === 'success' ? 'check' : 'error-warning'}-line`} /> {toast.msg}</div>)}

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search course, code, doctor..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
          <select value={filters.semesterId ?? ''} onChange={e => setFilters(p => ({ ...p, semesterId: e.target.value ? Number(e.target.value) : undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="">All Semesters</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filters.departmentId ?? ''} onChange={e => setFilters(p => ({ ...p, departmentId: e.target.value ? Number(e.target.value) : undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={filters.doctorId ?? ''} onChange={e => setFilters(p => ({ ...p, doctorId: e.target.value ? Number(e.target.value) : undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="">All Doctors</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
          </select>
          <select value={filters.roomId ?? ''} onChange={e => setFilters(p => ({ ...p, roomId: e.target.value ? Number(e.target.value) : undefined }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="">All Rooms</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="flex gap-1 flex-wrap">
          <button type="button" onClick={() => setDayFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dayFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>All Days</button>
          {DAYS.map((d, i) => (<button key={d} type="button" onClick={() => setDayFilter(String(i))} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dayFilter === String(i) ? 'bg-slate-700 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'}`}>{d.slice(0, 3)}</button>))}
        </div>
      </div>

      {/* View toggle + Add button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button type="button" onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><i className="ri-layout-grid-line mr-1" />Grid</button>
          <button type="button" onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><i className="ri-list-check mr-1" />Table</button>
        </div>
        <button type="button" onClick={() => handleOpenCreate()} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"><i className="ri-add-line" /> Add Schedule</button>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <WeeklyScheduleGrid blocks={timetableBlocks} loading={timetableLoading} onBlockClick={handleBlockClick} onSlotClick={handleSlotClick} />
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
          {loading && <div className="flex items-center gap-2 text-slate-400 text-sm mb-4"><i className="ri-loader-4-line animate-spin" /> Loading...</div>}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Cr.</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Room</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Day</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Enrolled</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(s => (
                    <tr key={s.scheduleId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3"><p className="text-sm font-medium text-slate-700">{s.courseCode}</p><p className="text-[10px] text-slate-400">{s.courseName}</p></td>
                      <td className="px-3 py-3 text-center text-xs text-slate-600">{s.creditHours}</td>
                      <td className="px-3 py-3 text-center text-xs text-slate-600">{s.doctorName}</td>
                      <td className="px-3 py-3 text-center text-xs text-slate-600">{s.departmentName}</td>
                      <td className="px-3 py-3 text-center text-xs text-slate-600">{s.roomName || '—'}{s.roomBuilding ? <span className="block text-[10px] text-slate-400">{s.roomBuilding}</span> : null}</td>
                      <td className="px-3 py-3 text-center text-xs font-medium text-slate-700">{DAYS[s.day] || s.day}</td>
                      <td className="px-3 py-3 text-center text-xs text-slate-700">{fmtTime(s.startTime)} – {fmtTime(s.endTime)}</td>
                      <td className="px-3 py-3 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${s.type === 0 ? 'bg-blue-50 text-blue-600' : s.type === 1 ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'}`}>{s.typeDisplay || SCHEDULE_TYPE_LABELS[s.type as 0|1|2]}</span></td>
                      <td className="px-3 py-3 text-center text-xs text-slate-600">{s.enrolledCount}/{s.maxCapacity}</td>
                      <td className="px-3 py-3 text-center"><div className="flex items-center justify-center gap-1">
                        <button type="button" onClick={() => handleOpenEdit(s)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500"><i className="ri-pencil-line text-sm" /></button>
                        <button type="button" onClick={() => setDeleteId(s.scheduleId)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"><i className="ri-delete-bin-line text-sm" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {!loading && filtered.length === 0 && (<div className="text-center py-12 bg-white rounded-xl border border-gray-100 mt-2"><div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4"><i className="ri-calendar-line text-3xl text-slate-400" /></div><p className="text-sm text-slate-500">No course schedules found.</p></div>)}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-800">{editingItem ? 'Edit Schedule' : 'Add Course Schedule'}</h2><button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"><i className="ri-close-line" /></button></div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {!editingItem && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Course Instance *</label>
                  <select
                    value={form.courseInstanceId || ""}
                    onChange={e => {
                      const ciId = Number(e.target.value);
                      const ci = courseInstances.find(x => x.id === ciId);
                      if (ci) handleSelectCourseInstance(ci);
                      else {
                        setForm(p => ({ ...p, courseInstanceId: 0 }));
                        setSelectedCi(null);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="" disabled>Select a course...</option>
                    {courseInstances.map(ci => (
                      <option key={ci.id} value={ci.id}>
                        {ci.courseCode} — {ci.courseName} (Dr. {ci.doctorName})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Selected course info badge */}
              {selectedCi && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-800">{selectedCi.courseCode} — {selectedCi.courseName}</p>
                    <p className="text-[10px] text-blue-600">{selectedCi.doctorName} · {selectedCi.creditHours} credits · Theory: {selectedCi.theoryHours}h · Practical: {selectedCi.practicalHours}h</p>
                  </div>
                  <span className="text-[9px] text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">Suggested: {getSuggestedDuration(selectedCi, form.type)}h</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Day *</label><select value={form.day} onChange={e => setForm(p => ({ ...p, day: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">{DAYS.slice(0,5).map((d, i) => <option key={d} value={i}>{d}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Type *</label><select value={form.type} onChange={e => handleTypeChange(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"><option value={0}>Lecture</option><option value={1}>Lab</option><option value={2}>Tutorial</option></select></div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Quick Fill</label>
                <div className="flex flex-wrap gap-1">
                  {TIME_PRESETS.map(p => (<button key={p.label} type="button" onClick={() => setForm(f => ({ ...f, startTime: p.start, endTime: p.end }))} className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${form.startTime === p.start && form.endTime === p.end ? 'bg-slate-700 text-white' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}>{p.label}</button>))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Start Time *</label><input type="time" required value={form.startTime?.slice(0,5)} onChange={e => setForm(p => ({ ...p, startTime: e.target.value + ':00' }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" /></div>
                <div><label className="block text-xs font-medium text-slate-600 mb-1">End Time *</label><input type="time" required value={form.endTime?.slice(0,5)} onChange={e => setForm(p => ({ ...p, endTime: e.target.value + ':00' }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" /></div>
              </div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Room</label>
                <select value={form.roomId ?? ''} onChange={e => setForm(p => ({ ...p, roomId: e.target.value ? Number(e.target.value) : undefined }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                  <option value="">— No Room —</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50">{submitting ? <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin" /> Saving...</span> : editingItem ? 'Save Changes' : 'Create Schedule'}</button>
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
            <h3 className="text-sm font-semibold text-slate-800 text-center mb-1">Delete Schedule?</h3>
            <p className="text-xs text-slate-500 text-center mb-5">This action cannot be undone.</p>
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
