import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchDoctorCourseDetail,
  fetchCourseStudents,
  fetchCourseMaterials,
  createCourseMaterial,
  deleteCourseMaterial,
} from '@/lib/doctorPortalApi';
import type {
  DoctorCourseDetail,
  DoctorCourseStudent,
  DoctorMaterialWeek,
  DoctorCourseMaterial,
  CreateMaterialForm,
} from '@/types/doctor';
import { MATERIAL_TYPE_LABELS, ENROLLMENT_STATUS_LABELS, EnrollmentStatus } from '@/lib/enums';
import { resolveFileUrl, isExternalLink, downloadFile, isPreviewable } from '@/lib/fileUtils';

const TABS = [
  { id: 'students', label: 'Students', icon: 'ri-user-line' },
  { id: 'materials', label: 'Materials', icon: 'ri-folder-line' },
];

const EMPTY_MATERIAL: CreateMaterialForm = { title: '', type: 1, contentUrl: '', file: undefined };

export default function DoctorCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<DoctorCourseDetail | null>(null);
  const [students, setStudents] = useState<DoctorCourseStudent[]>([]);
  const [materialWeeks, setMaterialWeeks] = useState<DoctorMaterialWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');

  // Material modal state
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState<CreateMaterialForm>(EMPTY_MATERIAL);
  const [savingMaterial, setSavingMaterial] = useState(false);
  const [materialMsg, setMaterialMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Student search
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    if (!id) return;
    const cid = Number(id);
    Promise.all([
      fetchDoctorCourseDetail(cid),
      fetchCourseStudents(cid),
      fetchCourseMaterials(cid),
    ]).then(([courseRes, studentsRes, materialsRes]) => {
      setCourse(courseRes.data);
      setStudents(studentsRes.data?.students ?? []);
      setMaterialWeeks(materialsRes.data?.weeks ?? []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSearchStudents = useCallback(async (q: string) => {
    setStudentSearch(q);
    if (!id) return;
    const { data } = await fetchCourseStudents(Number(id), q || undefined);
    setStudents(data?.students ?? []);
  }, [id]);

  const handleAddMaterial = useCallback(async () => {
    if (!id || !materialForm.title) {
      setMaterialMsg({ type: 'error', text: 'Title is required.' });
      return;
    }
    if (materialForm.type === 1 && !materialForm.file) {
      setMaterialMsg({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }
    if (materialForm.type === 2 && !materialForm.contentUrl) {
      setMaterialMsg({ type: 'error', text: 'Please enter a valid URL.' });
      return;
    }
    setSavingMaterial(true);
    setMaterialMsg(null);
    const { success, error } = await createCourseMaterial(Number(id), materialForm);
    if (success) {
      // Refresh materials
      const { data } = await fetchCourseMaterials(Number(id));
      setMaterialWeeks(data?.weeks ?? []);
      setMaterialForm(EMPTY_MATERIAL);
      setShowMaterialModal(false);
      setMaterialMsg({ type: 'success', text: 'Material uploaded successfully!' });
    } else {
      setMaterialMsg({ type: 'error', text: error ?? 'Failed to upload material.' });
    }
    setSavingMaterial(false);
  }, [id, materialForm]);

  const handleDeleteMaterial = useCallback(async (materialId: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const { success, error } = await deleteCourseMaterial(materialId);
    if (success) {
      const { data } = await fetchCourseMaterials(Number(id));
      setMaterialWeeks(data?.weeks ?? []);
    } else {
      setMaterialMsg({ type: 'error', text: error ?? 'Failed to delete material.' });
    }
  }, [id]);

  const attendanceBadge = (pct: number) => {
    if (pct >= 85) return 'text-emerald-600';
    if (pct >= 75) return 'text-amber-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <i className="ri-loader-4-line animate-spin" />
        Loading course details...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Failed to load course details.</p>
        <button type="button" onClick={() => navigate('/doctor/courses')} className="mt-4 text-sm text-violet-600 hover:underline">
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/doctor/courses')}
          className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <i className="ri-arrow-left-line text-slate-500" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600">
              {course.courseCode}
            </span>
            <span className="text-[10px] text-slate-400">{course.semesterName}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">{course.courseName}</h1>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Enrolled', value: course.enrolledCount, icon: 'ri-user-line', color: 'text-violet-600 bg-violet-50' },
          { label: 'Capacity', value: course.maxCapacity, icon: 'ri-team-line', color: 'text-blue-600 bg-blue-50' },
          { label: 'Credit Hrs', value: course.creditHours, icon: 'ri-time-line', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Materials', value: materialWeeks.reduce((n, w) => n + w.materials.length, 0), icon: 'ri-folder-line', color: 'text-amber-600 bg-amber-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <i className={`${s.icon} text-sm`} />
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
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.id
              ? 'bg-white text-violet-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <i className={tab.icon} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Students tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Enrolled Students</h3>
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => handleSearchStudents(e.target.value)}
                placeholder="Search students..."
                className="pl-8 pr-4 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-violet-200 w-48"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Section</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Attendance</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s, idx) => (
                  <tr key={s.studentId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {s.profilePictureUrl ? (
                          <img src={s.profilePictureUrl} alt={s.studentName} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600">
                            {s.studentName.charAt(0)}
                          </div>
                        )}
                        <p className="text-sm font-medium text-slate-700">{s.studentName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-slate-500">{s.studentCode}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600">{s.section}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-medium ${attendanceBadge(s.attendancePercentage ?? 0)}`}>
                        {(s.attendancePercentage ?? 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.status === EnrollmentStatus.Enrolled ? 'bg-emerald-50 text-emerald-600' : s.status === EnrollmentStatus.Waitlisted ? 'bg-amber-50 text-amber-600' : s.status === EnrollmentStatus.Dropped ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {ENROLLMENT_STATUS_LABELS[s.status as EnrollmentStatus] || `Status ${s.status}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && (
              <div className="text-center py-8 text-sm text-slate-400">No students found.</div>
            )}
          </div>
        </div>
      )}

      {/* Materials tab */}
      {activeTab === 'materials' && (
        <div>
          {materialMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${materialMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
              {materialMsg.text}
            </div>
          )}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => { setShowMaterialModal(true); setMaterialMsg(null); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors"
            >
              <i className="ri-upload-line" />
              + Add Material
            </button>
          </div>

          {materialWeeks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <i className="ri-folder-line text-xl text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">No materials uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {materialWeeks.map((week) => (
                <div key={week.weekNumber} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <i className="ri-folder-line text-slate-400 text-sm" />
                    <h3 className="text-xs font-semibold text-slate-700">Week {week.weekNumber}</h3>
                    <span className="text-[10px] text-slate-400 ml-auto">{week.materials.length} files</span>
                  </div>
                  {week.materials.length === 0 ? (
                    <p className="px-5 py-3 text-xs text-slate-400">No materials yet.</p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {week.materials.map((m: DoctorCourseMaterial) => (
                        <div key={m.materialId} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100">
                            <i className={`${m.type === 2 ? 'ri-link' : 'ri-file-line'} text-violet-500 text-sm`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{m.title}</p>
                            <p className="text-[10px] text-slate-400">
                              {MATERIAL_TYPE_LABELS[m.type as 0 | 1 | 2]} · {new Date(m.createdOn).toLocaleDateString()}
                              {m.downloadCount > 0 && ` · ${m.downloadCount} downloads`}
                            </p>
                          </div>
                          <a
                            href={resolveFileUrl(m.contentUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={isExternalLink(m.contentUrl) ? 'Open link' : (isPreviewable(m.contentUrl) ? 'Preview file' : 'Open file')}
                            className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-violet-50 flex items-center justify-center border border-gray-100 transition-colors shrink-0"
                          >
                            <i className={`${isExternalLink(m.contentUrl) ? 'ri-external-link-line' : 'ri-eye-line'} text-slate-400 text-xs`} />
                          </a>
                          {!isExternalLink(m.contentUrl) && (
                            <button
                              type="button"
                              title="Download file"
                              onClick={() => downloadFile(m.contentUrl, m.title)}
                              className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-blue-50 flex items-center justify-center border border-gray-100 transition-colors shrink-0"
                            >
                              <i className="ri-download-line text-slate-400 text-xs" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteMaterial(m.materialId, m.title)}
                            className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-red-50 flex items-center justify-center border border-gray-100 transition-colors shrink-0"
                          >
                            <i className="ri-delete-bin-line text-slate-400 hover:text-red-500 text-xs" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Add Material</h2>
              <button type="button" onClick={() => setShowMaterialModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                <i className="ri-close-line text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  maxLength={200}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="e.g., Lecture 3 — Linked Lists"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Type</label>
                <div className="flex gap-2">
                  {[{ id: 1, label: '📄 File' }, { id: 2, label: '🔗 Link' }].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMaterialForm({ ...materialForm, type: t.id })}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border ${materialForm.type === t.id ? 'bg-violet-600 text-white border-violet-600' : 'bg-gray-50 text-slate-600 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              {materialForm.type === 2 ? (
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">URL *</label>
                  <input
                    type="url"
                    value={materialForm.contentUrl}
                    onChange={(e) => setMaterialForm({ ...materialForm, contentUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="https://..."
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase mb-1">Upload File *</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setMaterialForm({ ...materialForm, file });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Allowed: PDF, DOC/X, PPT/X, ZIP (Max 10MB)</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button type="button" onClick={() => setShowMaterialModal(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-slate-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMaterial}
                disabled={savingMaterial}
                className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {savingMaterial ? <i className="ri-loader-4-line animate-spin" /> : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}