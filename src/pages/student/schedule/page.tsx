import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStudentSchedule } from '@/lib/studentPortalApi';
import type { StudentScheduleData, StudentScheduleSlot } from '@/types/student';
import { SCHEDULE_TYPE_LABELS, DAY_OF_WEEK_LABELS } from '@/lib/enums';
import PortalWeeklyGrid from '@/components/PortalWeeklyGrid';
import type { PortalScheduleBlock } from '@/components/PortalWeeklyGrid';

const DAY_NUMBERS = [0, 1, 2, 3, 4, 5, 6];

export default function StudentSchedule() {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchStudentSchedule()
      .then((d) => {
        setData(d);
        const today = new Date().getDay();
        setSelectedDay(today);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const slotsByDay = useMemo<Record<number, StudentScheduleSlot[]>>(() => {
    const map: Record<number, StudentScheduleSlot[]> = {};
    DAY_NUMBERS.forEach((d) => (map[d] = []));
    if (data?.weeklySchedule) {
      data.weeklySchedule.forEach((day) => {
        map[day.day] = [...(day.slots || [])].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
      });
    }
    return map;
  }, [data]);

  const slotsForSelectedDay = slotsByDay[selectedDay] ?? [];

  const totalSessions = useMemo(() =>
    DAY_NUMBERS.reduce((sum, d) => sum + slotsByDay[d].length, 0),
    [slotsByDay]
  );

  // Convert to grid blocks
  const gridBlocks = useMemo<PortalScheduleBlock[]>(() => {
    const blocks: PortalScheduleBlock[] = [];
    DAY_NUMBERS.forEach(d => {
      slotsByDay[d].forEach(slot => {
        blocks.push({
          id: slot.courseScheduleId,
          courseCode: slot.courseCode,
          courseName: slot.courseName,
          day: d,
          startTime: slot.startTime,
          endTime: slot.endTime,
          type: slot.type,
          roomName: slot.roomName,
          doctorName: slot.doctorName,
        });
      });
    });
    return blocks;
  }, [slotsByDay]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Schedule</h1>
          {data?.semesterName && (
            <p className="text-xs text-slate-500 mt-0.5">{data.semesterName}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button type="button" onClick={() => setViewMode('grid')} className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}><i className="ri-layout-grid-line mr-0.5" />Grid</button>
            <button type="button" onClick={() => setViewMode('list')} className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}><i className="ri-list-check mr-0.5" />List</button>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <i className="ri-calendar-line" />
            {totalSessions} sessions/week
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading schedule...
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && !loading && (
        <PortalWeeklyGrid blocks={gridBlocks} loading={false} accentColor="emerald" />
      )}

      {/* List View */}
      {viewMode === 'list' && !loading && (
        <>
          {/* Day Selector */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
            {DAY_NUMBERS.map((dayNum) => {
              const count = slotsByDay[dayNum]?.length || 0;
              const label = DAY_OF_WEEK_LABELS[dayNum as 0 | 1 | 2 | 3 | 4 | 5 | 6];
              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => setSelectedDay(dayNum)}
                  className={`flex flex-col items-center px-4 py-2.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    selectedDay === dayNum
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[10px] opacity-70">{label.slice(0, 3)}</span>
                  <span className="text-sm font-bold">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Schedule for selected day */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              {DAY_OF_WEEK_LABELS[selectedDay as 0 | 1 | 2 | 3 | 4 | 5 | 6]}'s Classes
              {slotsForSelectedDay.length > 0 && (
                <span className="text-[10px] font-normal text-slate-400 ml-2">
                  ({slotsForSelectedDay.length} sessions)
                </span>
              )}
            </h2>

            {slotsForSelectedDay.length > 0 ? (
              <div className="space-y-3">
                {slotsForSelectedDay.map((slot) => (
                  <button
                    key={slot.courseScheduleId}
                    type="button"
                    onClick={() => navigate(`/student/courses/${slot.courseScheduleId}`)}
                    className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-emerald-50/30 transition-colors w-full text-left"
                  >
                    <div
                      className="w-1 h-12 rounded-full shrink-0"
                      style={{ backgroundColor: slot.colorCode || '#10b981' }}
                    />
                    <div className="text-center shrink-0 w-14">
                      <p className="text-xs font-bold text-slate-700">{slot.startTime.slice(0, 5)}</p>
                      <p className="text-[10px] text-slate-400">{slot.endTime.slice(0, 5)}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-slate-800 truncate">{slot.courseName}</p>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 shrink-0">
                          {slot.courseCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <i className="ri-map-pin-line" />
                          {slot.roomName}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-user-line" />
                          {slot.doctorName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {SCHEDULE_TYPE_LABELS[slot.type as 0 | 1 | 2]}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <i className="ri-calendar-line text-xl text-slate-400" />
                </div>
                <p className="text-sm text-slate-400">
                  No classes on {DAY_OF_WEEK_LABELS[selectedDay as 0 | 1 | 2 | 3 | 4 | 5 | 6]}.
                </p>
                {totalSessions === 0 && (
                  <button
                    type="button"
                    onClick={() => navigate('/student/registration')}
                    className="mt-3 text-xs text-emerald-600 hover:underline"
                  >
                    Go to Registration →
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}