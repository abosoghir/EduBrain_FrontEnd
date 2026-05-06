import React, { useEffect, useState, useMemo } from 'react';
import { fetchExamSchedule } from '@/lib/studentPortalApi';
import type { StudentExamData, StudentExam, NextExamSummary } from '@/types/student';
import { EXAM_TYPE_LABELS, DAY_OF_WEEK_LABELS } from '@/lib/enums';

export default function StudentExams() {
  const [data, setData] = useState<StudentExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchExamSchedule()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const exams = data?.exams ?? [];

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

  const examTypeBadge = (type: number) => {
    const colors: Record<number, string> = {
      0: 'bg-orange-50 text-orange-600',
      1: 'bg-blue-50 text-blue-600',
      2: 'bg-violet-50 text-violet-600',
      3: 'bg-slate-50 text-slate-600',
    };
    return colors[type] ?? 'bg-gray-50 text-gray-600';
  };

  const ExamCard = ({ exam, dim = false }: { exam: StudentExam; dim?: boolean }) => (
    <div className={`bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${dim ? 'opacity-60' : ''}`}>
      {/* Date box */}
      <div className="flex items-center gap-3 shrink-0">
        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center ${dim ? 'bg-slate-50' : 'bg-emerald-50'}`}>
          <span className={`text-[10px] font-medium uppercase ${dim ? 'text-slate-500' : 'text-emerald-600'}`}>
            {new Date(exam.examDate).toLocaleDateString(undefined, { month: 'short' })}
          </span>
          <span className={`text-lg font-bold ${dim ? 'text-slate-700' : 'text-emerald-700'}`}>
            {new Date(exam.examDate).getDate()}
          </span>
        </div>
        <div>
          <p className="text-xs text-slate-400">
            {DAY_OF_WEEK_LABELS[exam.day as 0 | 1 | 2 | 3 | 4 | 5 | 6]}
          </p>
          <p className="text-xs text-slate-500">{exam.startTime.slice(0, 5)} — {exam.endTime.slice(0, 5)}</p>
          {!dim && exam.daysRemaining !== undefined && (
            <p className="text-[10px] font-medium text-emerald-600">In {exam.daysRemaining} days</p>
          )}
        </div>
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-800">{exam.courseName}</h3>
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500">{exam.courseCode}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${examTypeBadge(exam.examType)}`}>
            {EXAM_TYPE_LABELS[exam.examType as 0 | 1 | 2 | 3]}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-400 flex-wrap">
          <span className="flex items-center gap-1">
            <i className="ri-map-pin-line" />
            {exam.hallName}
          </span>
          {exam.seatNumber !== null && (
            <span className="flex items-center gap-1">
              <i className="ri-user-line" />
              Seat {exam.seatNumber}
            </span>
          )}
          {exam.notes && (
            <span className="flex items-center gap-1 text-amber-500">
              <i className="ri-information-line" />
              {exam.notes}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-slate-800">Exam Schedule</h1>
        <div className="flex gap-2 flex-wrap">
          {(['all', 0, 1, 2, 3] as const).map((type) => (
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

      {/* Stats Bar */}
      {data && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Exams', value: data.totalExams, icon: 'ri-file-list-line', color: 'text-slate-600 bg-slate-50' },
            { label: 'Days to First', value: data.daysToFirstExam ?? '—', icon: 'ri-calendar-line', color: 'text-orange-600 bg-orange-50' },
            { label: 'Next Exam', value: data.nextExamCourseName?.split(' — ')[0] ?? '—', icon: 'ri-alarm-line', color: 'text-emerald-600 bg-emerald-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
                <i className={`${s.icon} text-sm`} />
              </div>
              <p className="text-base font-bold text-slate-800 truncate">{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Next Exam Hero Card */}
      {data?.nextExam && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-5 mb-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-emerald-100 uppercase tracking-wider mb-1">Next Exam</p>
              <h2 className="text-base font-bold">{data.nextExam.courseName}</h2>
              <p className="text-sm text-emerald-100 mt-1">
                {EXAM_TYPE_LABELS[data.nextExam.examType as 0 | 1 | 2 | 3]} ·{' '}
                {new Date(data.nextExam.examDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-emerald-100">
                <span className="flex items-center gap-1">
                  <i className="ri-time-line" />
                  {data.nextExam.startTime.slice(0, 5)}
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-map-pin-line" />
                  {data.nextExam.hallName}
                </span>
                {data.nextExam.seatNumber !== null && (
                  <span className="flex items-center gap-1">
                    <i className="ri-user-line" />
                    Seat {data.nextExam.seatNumber}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold">{data.nextExam.daysRemaining}</p>
              <p className="text-xs text-emerald-100">days away</p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Exams */}
      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <i className="ri-calendar-event-line text-emerald-600" />
            Upcoming ({upcoming.length})
          </h2>
          <div className="space-y-3">
            {upcoming.map((exam) => <ExamCard key={exam.examScheduleId} exam={exam} />)}
          </div>
        </div>
      )}

      {/* Past Exams */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <i className="ri-history-line text-slate-400" />
            Past ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map((exam) => <ExamCard key={exam.examScheduleId} exam={exam} dim />)}
          </div>
        </div>
      )}

      {!loading && upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-file-list-line text-3xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No exams found.</p>
        </div>
      )}
    </div>
  );
}