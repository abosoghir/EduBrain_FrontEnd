import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { DoctorGradeStudent, SubmitGradesRequest } from '@/types/doctor';


interface GradeEntry {
  studentId: string;
  gradeValue: string;
}

export default function DoctorGrades() {
  const [students, setStudents] = useState<DoctorGradeStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGradeType, setSelectedGradeType] = useState<string>('');
  const [entries, setEntries] = useState<Record<string, string>>();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api.get<ApiResponse<DoctorGradeStudent[]>>('/api/doctor/grades/students')
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setStudents(res.data.data);
        } else {
          setStudents([]);
        }
      })
      .catch(() => {
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const gradeTypes = useMemo(() => {
    if (!students.length) return [];
    const types = new Set<string>();
    students.forEach((s) => s.gradeItems.forEach((g) => types.add(g.gradeType)));
    return Array.from(types);
  }, [students]);

  const currentGradeType = useMemo(() => {
    if (!selectedGradeType || !students.length) return null;
    return students[0]?.gradeItems.find((g) => g.gradeType === selectedGradeType);
  }, [selectedGradeType, students]);

  const maxGrade = currentGradeType?.maxGrade ?? 100;

  const handleEntryChange = useCallback((studentId: string, value: string) => {
    setEntries((prev) => ({ ...prev, [studentId]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedGradeType || !students.length) return;
    setSaving(true);
    setMessage(null);
    const payload: SubmitGradesRequest = {
      courseId: students[0]?.gradeItems.length ? 101 : 0,
      gradeType: selectedGradeType,
      grades: Object.entries(entries)
        .filter(([, v]) => v.trim() !== '')
        .map(([studentId, gradeValue]) => ({ studentId, gradeValue: parseFloat(gradeValue) })),
    };
    try {
      const res = await api.post<ApiResponse<null>>('/api/doctor/grades', payload);
      if (res.data.isSuccess) {
        setMessage({ type: 'success', text: 'Grades submitted successfully.' });
        setEntries({});
      } else {
        setMessage({ type: 'error', text: res.data.error?.description || 'Failed to submit grades.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  }, [selectedGradeType, students, entries]);

  const gradeColor = (grade: number) => {
    if (grade >= 90) return 'text-emerald-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-amber-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Grade Entry</h1>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
          <i className="ri-loader-4-line animate-spin" />
          Loading students...
        </div>
      )}

      {/* Grade Type Selector */}
      {gradeTypes.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-slate-500">Select assessment:</span>
          <div className="flex gap-1">
            {gradeTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedGradeType(type);
                  setEntries({});
                  setMessage(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedGradeType === type
                    ? 'bg-violet-600 text-white'
                    : 'bg-white border border-gray-100 text-slate-600 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      {/* Grade Entry Form */}
      {selectedGradeType && students.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">{selectedGradeType}</h2>
              <p className="text-[10px] text-slate-400">Max grade: {maxGrade} points</p>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors disabled:opacity-60"
            >
              {saving ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-line" />}
              Submit Grades
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Current Grade</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Previous {selectedGradeType}</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Enter Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => {
                  const gradeItem = s.gradeItems.find((g) => g.gradeType === selectedGradeType);
                  const existingValue = gradeItem?.gradeValue;
                  return (
                    <tr key={s.studentId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
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
                      <td className="px-5 py-3 text-center">
                        <span className={`text-sm font-bold ${gradeColor(s.currentGrade ?? 0)}`}>
                          {s.currentGrade ?? '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs text-slate-500">
                          {existingValue !== undefined ? `${existingValue}/${maxGrade}` : '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={maxGrade}
                          step={0.5}
                          value={entries[s.studentId] ?? ''}
                          onChange={(e) => handleEntryChange(s.studentId, e.target.value)}
                          placeholder={`0-${maxGrade}`}
                          className="w-20 text-center px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade Overview */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-slate-700">Grade Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                {gradeTypes.map((type) => (
                  <th key={type} className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{type}</th>
                ))}
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s.studentId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
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
                  {gradeTypes.map((type) => {
                    const item = s.gradeItems.find((g) => g.gradeType === type);
                    return (
                      <td key={type} className="px-5 py-3 text-center">
                        <span className={`text-xs font-medium ${item?.gradeValue !== undefined ? gradeColor((item.gradeValue / item.maxGrade) * 100) : 'text-slate-400'}`}>
                          {item?.gradeValue !== undefined ? `${item.gradeValue}/${item.maxGrade}` : '-'}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-5 py-3 text-center">
                    <span className={`text-sm font-bold ${gradeColor(s.currentGrade ?? 0)}`}>
                      {s.currentGrade ?? '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}