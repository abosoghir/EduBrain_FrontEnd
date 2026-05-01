import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../../lib/api';
import type { ApiResponse } from '../../../lib/api';
import type { StudentScheduleSlot } from '../../../types/student';

import { SCHEDULE_TYPE_LABELS } from '../../../lib/enums';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentSchedule() {
  const [schedule, setSchedule] = useState<StudentScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>('Sunday');

  useEffect(() => {
    api.get<ApiResponse<StudentScheduleSlot[]>>('/api/student/schedule')
      .then((res) => {
        const payload = res.data?.data;
        if (res.data?.isSuccess && Array.isArray(payload)) {
          setSchedule(payload);
        } else {
          setSchedule([]);
        }
      })
      .catch(() => {
        setSchedule([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const scheduleByDay = useMemo(() => {
    const map: Record<string, StudentScheduleSlot[]> = {};
    DAYS.forEach((d) => (map[d] = []));
    const list = Array.isArray(schedule) ? schedule : [];
    list.forEach((slot) => {
      if (!map[slot.day]) map[slot.day] = [];
      map[slot.day].push(slot);
    });
    // Sort by start time
    DAYS.forEach((d) => {
      map[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return map;
  }, [schedule]);

  const hasClasses = useMemo(() => {
    return scheduleByDay[selectedDay]?.length > 0;
  }, [scheduleByDay, selectedDay]);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">My Schedule</h1>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading schedule...
        </div>
      )}

      {/* Day selector */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {DAYS.map((day) => {
          const count = scheduleByDay[day]?.length || 0;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`flex flex-col items-center px-4 py-2.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedDay === day
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-[10px] opacity-70">{day.slice(0, 3)}</span>
              <span className="text-sm font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Schedule for selected day */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          {selectedDay}'s Classes
          {hasClasses && (
            <span className="text-[10px] font-normal text-slate-400 ml-2">
              ({scheduleByDay[selectedDay].length} sessions)
            </span>
          )}
        </h2>

        {hasClasses ? (
          <div className="space-y-3">
            {scheduleByDay[selectedDay].map((slot) => (
              <div
                key={slot.courseScheduleId}
                className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-emerald-50/30 transition-colors"
              >
                <div className="text-center shrink-0 w-14">
                  <p className="text-xs font-bold text-slate-700">{slot.startTime.slice(0, 5)}</p>
                  <p className="text-[10px] text-slate-400">{slot.endTime.slice(0, 5)}</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-slate-800 truncate">{slot.courseName}</p>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500">
                      {slot.courseCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <i className="ri-map-pin-line" />
                      {slot.roomName}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-time-line" />
                      {SCHEDULE_TYPE_LABELS[slot.scheduleType as 0 | 1 | 2]}
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
            <p className="text-sm text-slate-400">No classes scheduled for {selectedDay}.</p>
          </div>
        )}
      </div>
    </div>
  );
}