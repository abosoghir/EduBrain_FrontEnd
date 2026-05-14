import React, { useMemo } from 'react';
import type { TimetableBlock } from '@/types/admin';
import { SCHEDULE_TYPE_LABELS } from '@/lib/enums';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const DAY_INDICES = [0, 1, 2, 3, 4]; // Sun–Thu
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]; // 8AM-8PM
const TOTAL_ROWS = HOURS.length; // 12 rows

const TYPE_COLORS: Record<number, { bg: string; border: string; text: string; badge: string }> = {
  0: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-600' },
  1: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-600' },
  2: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-100 text-purple-600' },
};

function fmtHour(h: number): string {
  if (h === 0 || h === 12) return `12 ${h < 12 ? 'AM' : 'PM'}`;
  return `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`;
}

function fmtTime(t: string): string {
  return t?.slice(0, 5) || t;
}

interface WeeklyScheduleGridProps {
  blocks: TimetableBlock[];
  loading: boolean;
  onBlockClick?: (block: TimetableBlock) => void;
  onSlotClick?: (day: number, hour: number) => void;
}

export default function WeeklyScheduleGrid({ blocks, loading, onBlockClick, onSlotClick }: WeeklyScheduleGridProps) {
  // Group blocks by day for efficient lookup
  const blocksByDay = useMemo(() => {
    const map = new Map<number, TimetableBlock[]>();
    for (const b of blocks) {
      const arr = map.get(b.gridColumn) || [];
      arr.push(b);
      map.set(b.gridColumn, arr);
    }
    return map;
  }, [blocks]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm p-4">
          <i className="ri-loader-4-line animate-spin" /> Loading timetable...
        </div>
      )}

      <div className="overflow-x-auto">
        <div
          className="grid min-w-[800px]"
          style={{
            gridTemplateColumns: '72px repeat(5, 1fr)',
            gridTemplateRows: `48px repeat(${TOTAL_ROWS}, 56px)`,
          }}
        >
          {/* Header: corner */}
          <div className="sticky left-0 z-20 bg-gray-50 border-b border-r border-gray-100 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Time</span>
          </div>

          {/* Header: days */}
          {DAYS.map((day, i) => (
            <div
              key={day}
              className="bg-gray-50 border-b border-r border-gray-100 flex items-center justify-center"
            >
              <span className="text-xs font-semibold text-slate-600">{day}</span>
            </div>
          ))}

          {/* Time rows */}
          {HOURS.map((hour, rowIdx) => (
            <React.Fragment key={hour}>
              {/* Time label */}
              <div
                className="sticky left-0 z-10 bg-white border-r border-b border-gray-50 flex items-start justify-end pr-2 pt-1"
                style={{ gridRow: rowIdx + 2, gridColumn: 1 }}
              >
                <span className="text-[10px] font-medium text-slate-400 leading-none whitespace-nowrap">
                  {fmtHour(hour)}
                </span>
              </div>

              {/* Day cells */}
              {DAY_INDICES.map(dayIdx => (
                <div
                  key={`${hour}-${dayIdx}`}
                  className="border-r border-b border-gray-50 relative cursor-pointer hover:bg-slate-50/50 transition-colors"
                  style={{ gridRow: rowIdx + 2, gridColumn: dayIdx + 2 }}
                  onClick={() => onSlotClick?.(dayIdx, hour)}
                />
              ))}
            </React.Fragment>
          ))}

          {/* Schedule blocks — positioned absolutely within the grid */}
          {DAY_INDICES.map(dayIdx => {
            const dayBlocks = blocksByDay.get(dayIdx) || [];
            return dayBlocks.map(block => {
              const colors = TYPE_COLORS[block.type] || TYPE_COLORS[0];
              const top = block.gridRow; // rows from top (fractional)
              const height = block.rowSpan; // span in rows

              return (
                <div
                  key={block.scheduleId}
                  className={`${colors.bg} ${colors.border} border rounded-lg mx-1 p-1.5 overflow-hidden cursor-pointer
                    hover:shadow-md hover:scale-[1.01] transition-all duration-150 flex flex-col justify-between z-10`}
                  style={{
                    gridColumn: dayIdx + 2,
                    gridRow: `${Math.floor(top) + 2} / span ${Math.max(1, Math.round(height))}`,
                    marginTop: `${(top % 1) * 56}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBlockClick?.(block);
                  }}
                  title={`${block.courseCode} — ${block.courseName}\n${fmtTime(block.startTime)} – ${fmtTime(block.endTime)}\nDoctor: ${block.doctorName}\nRoom: ${block.roomName || '—'}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-bold ${colors.text} truncate`}>
                        {block.courseCode}
                      </span>
                      <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${colors.badge} whitespace-nowrap`}>
                        {block.typeDisplay || SCHEDULE_TYPE_LABELS[block.type as 0|1|2]}
                      </span>
                    </div>
                    {height >= 1.5 && (
                      <p className={`text-[10px] ${colors.text} opacity-70 truncate mt-0.5`}>
                        {block.courseName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[9px] text-slate-500 truncate">
                      {block.doctorName}
                    </span>
                    <span className="text-[9px] text-slate-400 whitespace-nowrap">
                      {fmtTime(block.startTime)}–{fmtTime(block.endTime)}
                    </span>
                  </div>
                  {block.roomName && height >= 2 && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <i className="ri-map-pin-line text-[9px] text-slate-400" />
                      <span className="text-[9px] text-slate-400 truncate">{block.roomName}</span>
                    </div>
                  )}
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Empty state */}
      {!loading && blocks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-calendar-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No schedules found for this filter.</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or add a new schedule.</p>
        </div>
      )}

      {/* Legend */}
      {blocks.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-50">
          {Object.entries(TYPE_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${colors.bg} ${colors.border} border`} />
              <span className="text-[10px] text-slate-500">
                {SCHEDULE_TYPE_LABELS[Number(type) as 0|1|2]}
              </span>
            </div>
          ))}
          <div className="ml-auto text-[10px] text-slate-400">
            {blocks.length} schedule{blocks.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
