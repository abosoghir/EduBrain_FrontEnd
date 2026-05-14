import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchMyStudents } from '@/lib/advisorPortalApi';
import type { AdvisorStudentDto } from '@/types/advisor';

interface StudentPickerProps {
  value: number | null;
  onChange: (studentId: number, student: AdvisorStudentDto) => void;
  placeholder?: string;
  className?: string;
}

export default function StudentPicker({ value, onChange, placeholder = 'Search by name or code...', className = '' }: StudentPickerProps) {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<AdvisorStudentDto[]>([]);
  const [allStudents, setAllStudents] = useState<AdvisorStudentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AdvisorStudentDto | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Load all students on mount (advisor's students are finite — typically < 100)
  useEffect(() => {
    setLoading(true);
    fetchMyStudents({ pageSize: 100 })
      .then((res) => {
        const items = res.data?.students?.items ?? [];
        setAllStudents(items);
        setStudents(items);
      })
      .finally(() => setLoading(false));
  }, []);

  // If value is set externally, sync the selected student
  useEffect(() => {
    if (value && allStudents.length > 0) {
      const found = allStudents.find((s) => s.studentId === value);
      if (found && found.studentId !== selected?.studentId) {
        setSelected(found);
        setQuery('');
      }
    } else if (!value) {
      setSelected(null);
    }
  }, [value, allStudents]);

  // Filter locally as user types
  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!q.trim()) {
        setStudents(allStudents);
      } else {
        const lower = q.toLowerCase();
        setStudents(
          allStudents.filter(
            (s) =>
              s.studentName.toLowerCase().includes(lower) ||
              s.studentCode.toLowerCase().includes(lower)
          )
        );
      }
    }, 150);
  }, [allStudents]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (student: AdvisorStudentDto) => {
    setSelected(student);
    setQuery('');
    setOpen(false);
    onChange(student.studentId, student);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    setStudents(allStudents);
    onChange(0, null as unknown as AdvisorStudentDto);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {selected ? (
        // Selected state — show the chosen student
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-300 bg-amber-50/50 text-sm">
          {selected.profilePictureUrl ? (
            <img src={selected.profilePictureUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-700">
              {selected.studentName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="font-medium text-slate-800">{selected.studentName}</span>
            <span className="text-slate-400 ml-2 text-xs">{selected.studentCode}</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-amber-600 transition-colors shrink-0"
            title="Clear selection"
          >
            <i className="ri-close-line text-xs" />
          </button>
        </div>
      ) : (
        // Search state
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
          />
          {loading && (
            <i className="ri-loader-4-line animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          )}
        </div>
      )}

      {/* Dropdown */}
      {open && !selected && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-gray-100 shadow-lg max-h-64 overflow-y-auto">
          {students.length > 0 ? (
            students.map((s) => (
              <button
                key={s.studentId}
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 transition-colors text-left"
              >
                {s.profilePictureUrl ? (
                  <img src={s.profilePictureUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {s.studentName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{s.studentName}</p>
                  <p className="text-[10px] text-slate-400">{s.studentCode} · GPA: {s.gpa.toFixed(2)}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-xs text-slate-400">
              {loading ? 'Loading students...' : 'No students found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
