import React, { useState } from 'react';
import CourseSchedulesTab from './CourseSchedulesTab';
import ExamSchedulesTab from './ExamSchedulesTab';

const TABS = ['Course Schedules', 'Exam Schedules'] as const;
type Tab = typeof TABS[number];

export default function AdminSchedules() {
  const [activeTab, setActiveTab] = useState<Tab>('Course Schedules');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Schedule Management</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-slate-700 text-slate-800'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <i className={`ri-${tab === 'Course Schedules' ? 'calendar-line' : 'file-list-3-line'} mr-1.5`} />
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Course Schedules' && <CourseSchedulesTab />}
      {activeTab === 'Exam Schedules' && <ExamSchedulesTab />}
    </div>
  );
}