import React, { useMemo } from 'react';
import { SCHEDULE_TYPE_LABELS } from '@/lib/enums';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
const DAY_INDICES = [0, 1, 2, 3, 4];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const TYPE_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  0: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  1: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  2: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
};

export interface PortalScheduleBlock {
  id: number | string;
  courseCode: string;
  courseName: string;
  day: number;
  startTime: string;
  endTime: string;
  type: number;
  roomName?: string | null;
  doctorName?: string;
}

function timeToRow(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h - 8) + (m / 60);
}

function timeToSpan(start: string, end: string): number {
  return timeToRow(end) - timeToRow(start);
}

function fmtHour(h: number): string {
  if (h === 12) return '12 PM';
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

interface Props {
  blocks: PortalScheduleBlock[];
  loading?: boolean;
  accentColor?: string; // e.g. 'emerald' or 'violet'
}

export default function PortalWeeklyGrid({ blocks, loading, accentColor = 'slate' }: Props) {
  const blocksByDay = useMemo(() => {
    const map = new Map<number, PortalScheduleBlock[]>();
    for (const b of blocks) {
      const arr = map.get(b.day) || [];
      arr.push(b);
      map.set(b.day, arr);
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
          className="grid min-w-[700px]"
          style={{
            gridTemplateColumns: '60px repeat(5, 1fr)',
            gridTemplateRows: `40px repeat(${HOURS.length}, 52px)`,
          }}
        >
          {/* Corner */}
          <div className="bg-gray-50 border-b border-r border-gray-100 flex items-center justify-center">
            <span className="text-[9px] font-semibold text-slate-400 uppercase">Time</span>
          </div>

          {/* Day headers */}
          {DAYS.map(day => (
            <div key={day} className="bg-gray-50 border-b border-r border-gray-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-600">{day}</span>
            </div>
          ))}

          {/* Hour rows */}
          {HOURS.map((hour, rowIdx) => (
            <React.Fragment key={hour}>
              <div
                className="bg-white border-r border-b border-gray-50 flex items-start justify-end pr-2 pt-1"
                style={{ gridRow: rowIdx + 2, gridColumn: 1 }}
              >
                <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">{fmtHour(hour)}</span>
              </div>
              {DAY_INDICES.map(dayIdx => (
                <div
                  key={`${hour}-${dayIdx}`}
                  className="border-r border-b border-gray-50"
                  style={{ gridRow: rowIdx + 2, gridColumn: dayIdx + 2 }}
                />
              ))}
            </React.Fragment>
          ))}

          {/* Blocks */}
          {DAY_INDICES.map(dayIdx => {
            const dayBlocks = blocksByDay.get(dayIdx) || [];
            return dayBlocks.map(block => {
              const colors = TYPE_COLORS[block.type] || TYPE_COLORS[0];
              const top = timeToRow(block.startTime);
              const span = timeToSpan(block.startTime, block.endTime);
              if (top < 0 || span <= 0) return null;

              return (
                <div
                  key={block.id}
                  className={`${colors.bg} ${colors.border} border rounded-lg mx-0.5 p-1.5 overflow-hidden flex flex-col justify-between z-10`}
                  style={{
                    gridColumn: dayIdx + 2,
                    gridRow: `${Math.floor(top) + 2} / span ${Math.max(1, Math.round(span))}`,
                    marginTop: `${(top % 1) * 52}px`,
                  }}
                  title={`${block.courseCode} — ${block.courseName}\n${block.startTime.slice(0,5)} – ${block.endTime.slice(0,5)}${block.roomName ? `\nRoom: ${block.roomName}` : ''}${block.doctorName ? `\nDoctor: ${block.doctorName}` : ''}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-bold ${colors.text} truncate`}>{block.courseCode}</span>
                      <span className={`text-[7px] font-medium px-1 py-0.5 rounded-full ${colors.bg} ${colors.text} opacity-80 whitespace-nowrap`}>
                        {SCHEDULE_TYPE_LABELS[block.type as 0|1|2]}
                      </span>
                    </div>
                    {span >= 1.5 && (
                      <p className={`text-[9px] ${colors.text} opacity-70 truncate mt-0.5`}>{block.courseName}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    {block.roomName && <span className="text-[8px] text-slate-400 truncate"><i className="ri-map-pin-line" /> {block.roomName}</span>}
                    <span className="text-[8px] text-slate-400 whitespace-nowrap ml-auto">{block.startTime.slice(0,5)}–{block.endTime.slice(0,5)}</span>
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>

      {!loading && blocks.length === 0 && (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <i className="ri-calendar-line text-2xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No scheduled sessions.</p>
        </div>
      )}

      {blocks.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-50">
          {Object.entries(TYPE_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-2.5 h-2.5 rounded ${colors.bg} ${colors.border} border`} />
              <span className="text-[9px] text-slate-500">{SCHEDULE_TYPE_LABELS[Number(type) as 0|1|2]}</span>
            </div>
          ))}
          <span className="ml-auto text-[9px] text-slate-400">{blocks.length} session{blocks.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
