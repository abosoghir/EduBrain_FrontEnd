import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchDoctorCourses, fetchCourseGrades, updateStudentGrades, exportCourseGrades } from '@/lib/doctorPortalApi';
import type { DoctorCourse, DoctorGradesData, DoctorGradeStudent, GradeWeights, SubmitGradesRequest } from '@/types/doctor';
import { GRADE_LABELS, Grade } from '@/lib/enums';

// Grade enum → color
const GRADE_COLOR: Record<number, string> = {
  0: 'text-emerald-600', 1: 'text-emerald-600', 2: 'text-emerald-500',
  3: 'text-blue-600', 4: 'text-blue-500', 5: 'text-blue-400',
  6: 'text-amber-600', 7: 'text-amber-500', 8: 'text-amber-400',
  9: 'text-orange-500', 10: 'text-orange-400',
  11: 'text-red-600',
};

type GradeField = 'midterm' | 'final' | 'practical' | 'quizzes' | 'oral';
const GRADE_FIELDS: GradeField[] = ['midterm', 'final', 'practical', 'quizzes', 'oral'];

// Pending edit map: enrollmentId → partial grades
type EditMap = Record<number, Partial<Record<GradeField, string>>>;

export default function DoctorGrades() {
  const [courses, setCourses] = useState<DoctorCourse[]>([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [gradesData, setGradesData] = useState<DoctorGradesData | null>(null);
  const [gradesLoading, setGradesLoading] = useState(false);

  // Per-cell edit state
  const [editMap, setEditMap] = useState<EditMap>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load courses on mount
  useEffect(() => {
    fetchDoctorCourses().then(({ data }) => {
      setCourses(data?.courses ?? []);
      setCoursesLoaded(true);
    });
  }, []);

  const loadGrades = useCallback(async (courseInstanceId: number) => {
    setGradesLoading(true);
    setEditMap({});
    setMessage(null);
    const { data, error } = await fetchCourseGrades(courseInstanceId);
    if (data) {
      setGradesData(data);
    } else {
      setGradesData(null);
      setMessage({ type: 'error', text: error ?? 'Failed to load grades.' });
    }
    setGradesLoading(false);
  }, []);

  const handleCourseChange = useCallback((id: number | '') => {
    setSelectedCourseId(id);
    if (id) loadGrades(Number(id));
    else setGradesData(null);
  }, [loadGrades]);

  const setCell = useCallback((enrollmentId: number, field: GradeField, value: string) => {
    setEditMap((prev) => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], [field]: value },
    }));
  }, []);

  const handleSaveRow = useCallback(async (student: DoctorGradeStudent) => {
    const edits = editMap[student.enrollmentId];
    if (!edits || Object.keys(edits).length === 0) return;
    setSavingId(student.enrollmentId);
    setMessage(null);

    const payload: SubmitGradesRequest = {};
    GRADE_FIELDS.forEach((f) => {
      const raw = edits[f];
      if (raw !== undefined) {
        payload[f] = raw === '' ? null : parseFloat(raw);
      }
    });

    const { success, error } = await updateStudentGrades(student.enrollmentId, payload);
    if (success) {
      // Optimistically update local data
      setGradesData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          students: prev.students.map((s) =>
            s.enrollmentId === student.enrollmentId
              ? {
                  ...s,
                  midterm: payload.midterm !== undefined ? payload.midterm : s.midterm,
                  final: payload.final !== undefined ? payload.final : s.final,
                  practical: payload.practical !== undefined ? payload.practical : s.practical,
                  quizzes: payload.quizzes !== undefined ? payload.quizzes : s.quizzes,
                  oral: payload.oral !== undefined ? payload.oral : s.oral,
                }
              : s
          ),
        };
      });
      setEditMap((prev) => {
        const next = { ...prev };
        delete next[student.enrollmentId];
        return next;
      });
      setMessage({ type: 'success', text: `Grades updated for ${student.studentName}.` });
    } else {
      setMessage({ type: 'error', text: error ?? 'Failed to update grades.' });
    }
    setSavingId(null);
  }, [editMap]);

  const activeColumns = useMemo<GradeField[]>(() => {
    if (!gradesData) return [];
    return GRADE_FIELDS.filter((f) => (gradesData.weights[f] ?? 0) > 0);
  }, [gradesData]);

  const currentVal = (student: DoctorGradeStudent, field: GradeField) => {
    const edit = editMap[student.enrollmentId]?.[field];
    if (edit !== undefined) return edit;
    const v = student[field];
    return v !== null && v !== undefined ? String(v) : '';
  };

  const totalScore = (s: DoctorGradeStudent): string => {
    if (s.totalScore === null || s.totalScore === undefined) return '—';
    return s.totalScore.toFixed(1);
  };

  const weights = gradesData?.weights as GradeWeights | undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Grade Entry</h1>
        {gradesData && (
          <button
            type="button"
            onClick={() => exportCourseGrades(Number(selectedCourseId))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-slate-600 hover:bg-gray-50 transition-colors"
          >
            <i className="ri-download-line" />
            Export Excel
          </button>
        )}
      </div>

      {/* Course picker */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1.5">Select Course</label>
        <select
          value={selectedCourseId}
          onChange={(e) => handleCourseChange(e.target.value ? Number(e.target.value) : '')}
          className="w-full sm:w-80 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
        >
          <option value="">{coursesLoaded ? 'Choose a course...' : 'Loading...'}</option>
          {courses.map((c) => (
            <option key={c.courseInstanceId} value={c.courseInstanceId}>
              {c.courseCode} — {c.courseName}
            </option>
          ))}
        </select>
      </div>

      {gradesLoading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <i className="ri-loader-4-line animate-spin" />
          Loading grades...
        </div>
      )}

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      {gradesData && (
        <>
          {/* Weights legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            {activeColumns.map((f) => (
              <span key={f} className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 font-medium capitalize">
                {f}: {weights?.[f] ?? 0} pts
              </span>
            ))}
            <span className="px-2 py-0.5 rounded-full bg-violet-100 text-[10px] text-violet-700 font-medium">
              Total: {weights?.total ?? 100} pts
            </span>
          </div>

          {/* Grade spreadsheet */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">{gradesData.courseName}</h2>
              <span className="text-xs text-slate-400">{gradesData.students.length} students</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="sticky left-0 bg-gray-50 text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[180px]">Student</th>
                    {activeColumns.map((f) => (
                      <th key={f} className="text-center px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[110px] capitalize">
                        {f}<br />
                        <span className="text-[9px] font-normal text-slate-400">/ {weights?.[f] ?? 0}</span>
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[80px]">Total</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[60px]">Grade</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[80px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gradesData.students.map((s) => {
                    const isDirty = Object.keys(editMap[s.enrollmentId] ?? {}).length > 0;
                    const isSaving = savingId === s.enrollmentId;
                    return (
                      <tr
                        key={s.enrollmentId}
                        className={`hover:bg-gray-50/50 transition-colors ${isDirty ? 'bg-violet-50/30' : ''}`}
                      >
                        <td className="sticky left-0 bg-inherit px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600">
                              {s.studentName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">{s.studentName}</p>
                              <p className="text-[10px] text-slate-400">{s.studentCode}</p>
                            </div>
                          </div>
                        </td>
                        {activeColumns.map((f) => {
                          const max = weights?.[f] ?? 0;
                          return (
                            <td key={f} className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={max}
                                step={0.5}
                                value={currentVal(s, f)}
                                onChange={(e) => setCell(s.enrollmentId, f, e.target.value)}
                                placeholder="—"
                                className={`w-20 text-center px-2 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 transition-colors ${
                                  editMap[s.enrollmentId]?.[f] !== undefined
                                    ? 'border-violet-300 bg-violet-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                              />
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-slate-700">{totalScore(s)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.letterGrade !== null && s.letterGrade !== undefined ? (
                            <span className={`text-sm font-bold ${GRADE_COLOR[s.letterGrade] ?? 'text-slate-500'}`}>
                              {GRADE_LABELS[s.letterGrade as Grade] ?? '—'}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            disabled={!isDirty || isSaving}
                            onClick={() => handleSaveRow(s)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                              isDirty && !isSaving
                                ? 'bg-violet-600 text-white hover:bg-violet-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {isSaving ? <i className="ri-loader-4-line animate-spin" /> : 'Save'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!selectedCourseId && !gradesLoading && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <i className="ri-bar-chart-line text-xl text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">Select a course to view and enter grades.</p>
        </div>
      )}
    </div>
  );
}