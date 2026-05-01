import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../../lib/api';
import type { ApiResponse } from '../../../lib/api';
import type { StudentExam } from '../../../types/student';

import { EXAM_TYPE_LABELS } from '../../../lib/enums';

export default function StudentExams() {
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<number | 'all'>('all');

  useEffect(() => {
    api.get<ApiResponse<StudentExam[]>>('/api/student/exams')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && Array.isArray(res.data.data)) {
          setExams(res.data.data);
        } else {
          setExams([]);
        }
      })
      .catch(() => {
        setExams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filterType === 'all') return exams;
    return exams.filter((e) => e.examType === filterType);
  }, [exams, filterType]);

  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filtered.filter((e) => new Date(e.examDate) >= today);
  }, [filtered]);

  const past = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filtered.filter((e) => new Date(e.examDate) < today);
  }, [filtered]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-slate-800">Exam Schedule</h1>
        <div className="flex gap-2">
          {(['all', 0, 1, 2] as const).map((type) => (
            <button
              key={String(type)}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filterType === type ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
              }`}
            >
              {type === 'all' ? 'All' : EXAM_TYPE_LABELS[type as 0 | 1 | 2 | 3]}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading exams...
        </div>
      )}

      {/* Upcoming Exams */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <i className="ri-calendar-event-line text-emerald-600" />
            Upcoming Exams ({upcoming.length})
          </h2>
          <div className="space-y-3">
            {upcoming.map((exam) => (
              <div
                key={exam.examId}
                className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-emerald-600 font-medium uppercase">
                      {new Date(exam.examDate).toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-emerald-700">
                      {new Date(exam.examDate).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{new Date(exam.examDate).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                    <p className="text-xs text-slate-500">{exam.startTime} - {exam.endTime}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-800">{exam.courseName}</h3>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500">{exam.courseCode}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <i className="ri-map-pin-line" />
                      {exam.roomName}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-time-line" />
                      {exam.durationMinutes} min
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium">
                      {EXAM_TYPE_LABELS[exam.examType as 0 | 1 | 2 | 3]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Exams */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <i className="ri-history-line text-slate-400" />
            Past Exams ({past.length})
          </h2>
          <div className="space-y-3 opacity-60">
            {past.map((exam) => (
              <div
                key={exam.examId}
                className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-500 font-medium uppercase">
                      {new Date(exam.examDate).toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-slate-700">
                      {new Date(exam.examDate).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{new Date(exam.examDate).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                    <p className="text-xs text-slate-500">{exam.startTime} - {exam.endTime}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-800">{exam.courseName}</h3>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500">{exam.courseCode}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <i className="ri-map-pin-line" />
                      {exam.roomName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                      {EXAM_TYPE_LABELS[exam.examType as 0 | 1 | 2 | 3]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-list-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No exams found.</p>
        </div>
      )}
    </div>
  );
}