import React, { useState } from 'react';
import type { DoctorDetail } from '@/types/admin';
import { DOCTOR_TITLE_LABELS, SCHEDULE_TYPE_LABELS, DAY_OF_WEEK_LABELS, YEAR_LEVEL_LABELS } from '@/lib/enums';

type Tab = 'overview' | 'courses' | 'schedule' | 'ratings';

interface Props { doctor: DoctorDetail; onClose: () => void; }

export default function DoctorDetailPanel({ doctor, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'ri-user-line' },
    { key: 'courses', label: 'Courses', icon: 'ri-book-line' },
    { key: 'schedule', label: 'Schedule', icon: 'ri-calendar-line' },
    { key: 'ratings', label: 'Ratings', icon: 'ri-star-line' },
  ];
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-sm font-bold text-violet-600 overflow-hidden">
              {doctor.photoUrl ? <img src={doctor.photoUrl} alt="" className="w-full h-full object-cover" /> : doctor.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">{doctor.fullName}</h2>
              <p className="text-[10px] text-slate-400">{doctor.doctorCode} · {DOCTOR_TITLE_LABELS[doctor.title as 0|1|2|3|4]}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-gray-100"><i className="ri-close-line text-lg" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <i className={`${t.icon} text-sm`} />{t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-3">
                {([
                  ['Courses Taught', doctor.totalCoursesTaught],
                  ['Active Courses', doctor.activeCoursesCount],
                  ['Students', doctor.totalStudentsEnrolled],
                  ['Experience', `${doctor.yearsOfExperience}y`],
                ] as [string, string | number][]).map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-400 mb-1">{label}</p>
                    <p className="text-lg font-bold text-slate-700">{val}</p>
                  </div>
                ))}
              </div>
              {doctor.isDepartmentHead && (
                <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 rounded-lg text-xs text-violet-600">
                  <i className="ri-shield-star-line" /> Department Head
                </div>
              )}
              <div>
                <h3 className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1"><i className="ri-user-3-line" /> Personal Information</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  {([
                    ['Email', doctor.email],
                    ['Phone', doctor.phoneNumber],
                    ['National ID', doctor.nationalId],
                    ['Join Date', fmtDate(doctor.joinDate)],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label}><span className="text-slate-400">{label}:</span> <span className="text-slate-700 font-medium">{val || '—'}</span></div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1"><i className="ri-building-line" /> Department & Office</h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  {([
                    ['Department', `${doctor.departmentName} (${doctor.departmentCode})`],
                    ['Office Room', doctor.officeRoomName || '—'],
                    ['Location', doctor.officeLocation || '—'],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label}><span className="text-slate-400">{label}:</span> <span className="text-slate-700 font-medium">{val}</span></div>
                  ))}
                </div>
              </div>
              {/* Rating summary */}
              {doctor.totalRatings > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-600 mb-3">Rating Overview</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-center"><p className="text-3xl font-bold text-amber-500">{doctor.averageRating.toFixed(1)}</p><p className="text-[10px] text-slate-400">{doctor.totalRatings} ratings</p></div>
                    <div className="flex-1 space-y-1">
                      {doctor.ratingBreakdown.map(r => (
                        <div key={r.starRating} className="flex items-center gap-2 text-[10px]">
                          <span className="w-3 text-slate-500">{r.starRating}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${r.percentage}%` }} /></div>
                          <span className="w-8 text-right text-slate-400">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* COURSES */}
          {tab === 'courses' && (
            <div className="space-y-6">
              {doctor.currentCourses.length > 0 && (
                <div><h3 className="text-xs font-semibold text-slate-600 mb-3">Current Courses</h3>
                  <div className="space-y-2">{doctor.currentCourses.map(c => (
                    <div key={c.courseInstanceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div><p className="text-sm font-medium text-slate-700">{c.courseName}</p><p className="text-[10px] text-slate-400">{c.courseCode} · {c.creditHours}cr · {c.semesterName} · {YEAR_LEVEL_LABELS[c.yearLevel as 0|1|2|3]}</p></div>
                      <div className="text-right"><p className="text-xs font-medium text-slate-700">{c.enrolledStudents}/{c.maxCapacity}</p><span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">{c.status}</span></div>
                    </div>
                  ))}</div>
                </div>
              )}
              {doctor.pastCourses.length > 0 && (
                <div><h3 className="text-xs font-semibold text-slate-600 mb-3">Past Courses</h3>
                  <div className="space-y-2">{doctor.pastCourses.map(c => (
                    <div key={c.courseInstanceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div><p className="text-sm font-medium text-slate-700">{c.courseName}</p><p className="text-[10px] text-slate-400">{c.courseCode} · {c.creditHours}cr · {c.semesterName}</p></div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{c.status}</span>
                    </div>
                  ))}</div>
                </div>
              )}
              {doctor.currentCourses.length === 0 && doctor.pastCourses.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No courses found.</p>
              )}
            </div>
          )}

          {/* SCHEDULE */}
          {tab === 'schedule' && (
            <div>{doctor.weeklySchedule.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No schedule entries.</p> : (
              <div className="space-y-2">{doctor.weeklySchedule.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div><p className="text-sm font-medium text-slate-700">{s.courseName} <span className="text-[10px] text-slate-400">({s.courseCode})</span></p><p className="text-[10px] text-slate-400">{DAY_OF_WEEK_LABELS[s.day as keyof typeof DAY_OF_WEEK_LABELS]} · {s.startTime.slice(0,5)}–{s.endTime.slice(0,5)} · {s.roomName}</p></div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{SCHEDULE_TYPE_LABELS[s.scheduleType as keyof typeof SCHEDULE_TYPE_LABELS]}</span>
                </div>
              ))}</div>
            )}</div>
          )}

          {/* RATINGS */}
          {tab === 'ratings' && (
            <div>{doctor.recentReviews.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No reviews yet.</p> : (
              <div className="space-y-3">{doctor.recentReviews.map(r => (
                <div key={r.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-700">{r.studentName}</p><span className="text-[10px] text-slate-400">{r.courseName}</span></div>
                    <div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <i key={i} className={`ri-star-${i < r.rating ? 'fill' : 'line'} text-xs ${i < r.rating ? 'text-amber-400' : 'text-gray-300'}`} />)}</div>
                  </div>
                  <p className="text-xs text-slate-600">{r.comment}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{fmtDate(r.date)}</p>
                </div>
              ))}</div>
            )}</div>
          )}
        </div>
      </div>
    </div>
  );
}
