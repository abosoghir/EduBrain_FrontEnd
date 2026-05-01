import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { AdvisorStudentDetail } from '@/types/advisor';

import { GENDER_LABELS, YEAR_LEVEL_LABELS, WARNING_LEVEL_LABELS, WARNING_REASON_LABELS } from '@/lib/enums';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'ri-information-line' },
  { id: 'courses', label: 'Courses', icon: 'ri-book-line' },
  { id: 'warnings', label: 'Warnings', icon: 'ri-alert-line' },
  { id: 'fees', label: 'Fees', icon: 'ri-money-dollar-circle-line' },
];

export default function AdvisorStudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<AdvisorStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!id) return;
    api.get<ApiResponse<AdvisorStudentDetail>>(`/api/advisor/students/${id}`)
      .then((res) => {
        if (res.data.isSuccess && res.data.hasData && res.data.data) {
          setStudent(res.data.data);
        } else {
          setStudent(null);
        }
      })
      .catch(() => {
        setStudent(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const goBack = useCallback(() => {
    navigate('/advisor/students');
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <i className="ri-loader-4-line animate-spin" />
        Loading student details...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Failed to load student details.</p>
        <button type="button" onClick={goBack} className="mt-4 text-sm text-amber-600 hover:underline">Back to Students</button>
      </div>
    );
  }

  const warningLevelBadge = (level: number) => {
    const map: Record<number, string> = {
      1: 'bg-amber-50 text-amber-600',
      2: 'bg-orange-50 text-orange-600',
      3: 'bg-red-50 text-red-600',
    };
    return map[level] || 'bg-gray-50 text-gray-600';
  };

  const gradeColor = (grade: number) => {
    if (grade >= 90) return 'text-emerald-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-amber-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={goBack}
          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <i className="ri-arrow-left-line text-slate-500" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white text-lg font-bold">
            {student.studentName.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{student.studentName}</h1>
            <p className="text-xs text-slate-500">{student.studentCode} · {student.departmentName} · {YEAR_LEVEL_LABELS[student.yearLevel as 0 | 1 | 2 | 3]}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'GPA', value: student.gpa.toFixed(2), icon: 'ri-bar-chart-line', color: student.gpa >= 3.5 ? 'text-emerald-600 bg-emerald-50' : student.gpa >= 2.5 ? 'text-slate-600 bg-slate-50' : 'text-red-600 bg-red-50' },
          { label: 'Credits', value: `${student.completedHours}/${student.totalCreditHours}`, icon: 'ri-time-line', color: 'text-blue-600 bg-blue-50' },
          { label: 'Attendance', value: `${student.attendancePercentage}%`, icon: 'ri-check-double-line', color: student.attendancePercentage >= 80 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50' },
          { label: 'Warnings', value: student.warnings.length, icon: 'ri-alert-line', color: student.warnings.length > 0 ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}>
                <i className={`${s.icon} text-sm`} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-800">{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-50 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Student Information</h3>
            <div className="space-y-3">
              {[
                { label: 'Email', value: student.email, icon: 'ri-mail-line' },
                { label: 'Phone', value: student.phoneNumber || 'Not provided', icon: 'ri-phone-line' },
                { label: 'Department', value: student.departmentName, icon: 'ri-building-line' },
                { label: 'Year Level', value: YEAR_LEVEL_LABELS[student.yearLevel as 0 | 1 | 2 | 3], icon: 'ri-stairs-line' },
                { label: 'Academic Year', value: student.academicYearName, icon: 'ri-calendar-line' },
                { label: 'Semester', value: student.semesterName, icon: 'ri-book-line' },
                { label: 'Gender', value: GENDER_LABELS[student.gender as 0 | 1], icon: 'ri-user-line' },
                { label: 'Date of Birth', value: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-', icon: 'ri-cake-line' },
                { label: 'Address', value: student.address || 'Not provided', icon: 'ri-map-pin-line' },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50">
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100">
                    <i className={`${row.icon} text-slate-400 text-xs`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{row.label}</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Academic Summary</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">GPA</span>
                  <span className={`text-sm font-bold ${gradeColor(student.gpa * 25)}`}>{student.gpa.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${student.gpa >= 3.5 ? 'bg-emerald-500' : student.gpa >= 2.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${(student.gpa / 4) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Credit Completion</span>
                  <span className="text-sm font-bold text-slate-700">{Math.round((student.completedHours / student.totalCreditHours) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(student.completedHours / student.totalCreditHours) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Attendance</span>
                  <span className={`text-sm font-bold ${student.attendancePercentage >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{student.attendancePercentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${student.attendancePercentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${student.attendancePercentage}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <p className="text-lg font-bold text-slate-800">{student.currentCourses.length}</p>
                    <p className="text-[10px] text-slate-400">Current Courses</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <p className="text-lg font-bold text-slate-800">{student.warnings.length}</p>
                    <p className="text-[10px] text-slate-400">Active Warnings</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <p className="text-lg font-bold text-red-600">{student.feesSummary.totalRemaining > 0 ? `${student.feesSummary.totalRemaining.toLocaleString()} EGP` : 'Paid'}</p>
                    <p className="text-[10px] text-slate-400">Fee Status</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-slate-700">Current Courses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Credits</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {student.currentCourses.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-700">{c.courseName}</p>
                      <p className="text-[10px] text-slate-400">{c.courseCode}</p>
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-slate-600">{c.credits}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-sm font-bold ${gradeColor(c.currentGrade ?? 0)}`}>{c.currentGrade ?? '-'}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-medium ${(c.attendancePercentage ?? 0) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {c.attendancePercentage ?? '-'}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'warnings' && (
        <div className="space-y-3">
          {student.warnings.length > 0 ? (
            student.warnings.map((w) => (
              <div key={w.warningId} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${warningLevelBadge(w.level)}`}>
                    <i className="ri-alert-line text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-800">{WARNING_REASON_LABELS[w.reason as 0 | 1 | 2 | 3]}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${warningLevelBadge(w.level)}`}>
                        Level {w.level}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-2">{w.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <i className="ri-calendar-line" />
                        {new Date(w.issuedDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="ri-user-line" />
                        {w.issuedBy}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-100">
              <p className="text-sm text-slate-400">No warnings on record.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <p className="text-lg font-bold text-slate-800">{student.feesSummary.totalFees.toLocaleString()} EGP</p>
              <p className="text-[10px] text-slate-400">Total Fees</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-emerald-50">
              <p className="text-lg font-bold text-emerald-600">{student.feesSummary.totalPaid.toLocaleString()} EGP</p>
              <p className="text-[10px] text-emerald-400">Paid</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50">
              <p className="text-lg font-bold text-red-600">{student.feesSummary.totalRemaining.toLocaleString()} EGP</p>
              <p className="text-[10px] text-red-400">Remaining</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Payment Progress</span>
              <span className="text-xs font-medium text-slate-700">
                {Math.round((student.feesSummary.totalPaid / student.feesSummary.totalFees) * 100)}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${(student.feesSummary.totalPaid / student.feesSummary.totalFees) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}