import React, { useEffect, useState, useMemo } from 'react';
import { fetchDoctorSchedule } from '@/lib/doctorPortalApi';
import type { DoctorScheduleSlot } from '@/types/doctor';
import { SCHEDULE_TYPE_LABELS } from '@/lib/enums';

// DayOfWeek enum: 0=Sunday, 1=Monday, ... 6=Saturday
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const TYPE_COLOR: Record<number, string> = {
  0: 'bg-violet-50 border-violet-200 text-violet-700',  // Lecture
  1: 'bg-emerald-50 border-emerald-200 text-emerald-700', // Lab
  2: 'bg-amber-50 border-amber-200 text-amber-700',     // Tutorial
};

export default function DoctorSchedule() {
  const [scheduleByDay, setScheduleByDay] = useState<Record<number, DoctorScheduleSlot[]>>({});
  const [stats, setStats] = useState<{ total: number; lectures: number; labs: number; hoursPerWeek: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(0); // default Sunday

  useEffect(() => {
    fetchDoctorSchedule()
      .then(({ data }) => {
        if (!data) return;
        setStats({
          total: data.totalSessions,
          lectures: data.lectureSessions,
          labs: data.labSessions,
          hoursPerWeek: data.totalHoursPerWeek,
        });
        // Build a map from day number → slots
        const map: Record<number, DoctorScheduleSlot[]> = {};
        for (let i = 0; i <= 6; i++) map[i] = [];
        data.weeklySchedule.forEach((dayEntry) => {
          map[dayEntry.day] = [...(dayEntry.slots ?? [])].sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
          );
        });
        setScheduleByDay(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const todaySlots = useMemo(() => scheduleByDay[selectedDay] ?? [], [scheduleByDay, selectedDay]);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">My Teaching Schedule</h1>

      {/* Stats bar */}
      {!loading && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Sessions', value: stats.total, icon: 'ri-calendar-line', color: 'text-violet-600 bg-violet-50' },
            { label: 'Lectures', value: stats.lectures, icon: 'ri-slideshow-line', color: 'text-blue-600 bg-blue-50' },
            { label: 'Labs', value: stats.labs, icon: 'ri-flask-line', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Hours/Week', value: stats.hoursPerWeek, icon: 'ri-time-line', color: 'text-amber-600 bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
                <i className={`${s.icon} text-sm`} />
              </div>
              <p className="text-xl font-bold text-slate-800">{s.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading schedule...
        </div>
      )}

      {/* Day tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {DAY_NAMES.map((day, idx) => {
          const count = scheduleByDay[idx]?.length ?? 0;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(idx)}
              className={`flex flex-col items-center px-4 py-2.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedDay === idx
                  ? 'bg-violet-600 text-white'
                  : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-[10px] opacity-70">{day.slice(0, 3)}</span>
              <span className="text-sm font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Day schedule */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          {DAY_NAMES[selectedDay]}'s Classes
          {todaySlots.length > 0 && (
            <span className="text-[10px] font-normal text-slate-400 ml-2">
              ({todaySlots.length} session{todaySlots.length !== 1 ? 's' : ''})
            </span>
          )}
        </h2>

        {todaySlots.length > 0 ? (
          <div className="space-y-3">
            {todaySlots.map((slot) => (
              <div
                key={slot.courseScheduleId}
                className={`flex items-center gap-4 p-4 rounded-lg border ${TYPE_COLOR[slot.type] ?? 'bg-gray-50 border-gray-200 text-gray-700'} transition-colors`}
              >
                <div className="text-center shrink-0 w-14">
                  <p className="text-xs font-bold">{slot.startTime.slice(0, 5)}</p>
                  <p className="text-[10px] opacity-70">{slot.endTime.slice(0, 5)}</p>
                </div>
                <div className="w-px h-10 bg-current opacity-20" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold truncate">{slot.courseName}</p>
                    <span className="px-1.5 py-0.5 rounded bg-white/60 text-[10px] font-medium opacity-80">
                      {slot.courseCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] opacity-70">
                    <span className="flex items-center gap-1">
                      <i className="ri-map-pin-line" />
                      {slot.roomName}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-time-line" />
                      {SCHEDULE_TYPE_LABELS[slot.type as 0 | 1 | 2]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <i className="ri-calendar-line text-xl text-slate-400" />
            </div>
            <p className="text-sm text-slate-400">No classes scheduled for {DAY_NAMES[selectedDay]}.</p>
          </div>
        )}
      </div>
    </div>
  );
}