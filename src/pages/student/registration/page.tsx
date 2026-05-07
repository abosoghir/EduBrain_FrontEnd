import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  fetchRegistrationStatus,
  fetchCourseCatalog,
  addToCart,
  fetchCart,
  removeFromCart,
  clearCart,
  confirmRegistration,
  fetchEnrollments,
  dropCourse,
  leaveWaitlist,
} from '@/lib/studentRegistrationApi';
import type {
  StudentRegistrationStatus,
  CourseCatalogItem,
  CartData,
  EnrollmentsData,
  Enrollment,
} from '@/types/student';
import { ENROLLMENT_STATUS_LABELS } from '@/lib/enums';

type Tab = 'overview' | 'browse' | 'cart' | 'enrollments';

function fmtDate(d?: string | null) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function StudentRegistrationPage() {
  const [tab, setTab] = useState<Tab>('overview');
  
  // Data States
  const [status, setStatus] = useState<StudentRegistrationStatus | null>(null);
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [cart, setCart] = useState<CartData | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentsData | null>(null);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'|'info'|'warning'} | null>(null);
  const [search, setSearch] = useState('');
  
  // Pagination / Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const showToast = (msg: string, type: 'success'|'error'|'info'|'warning') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadStatus = useCallback(async () => {
    try {
      const data = await fetchRegistrationStatus();
      setStatus(data);
    } catch (e: any) {
      console.error(e);
    }
  }, []);

  const loadCourses = useCallback(async () => {
    try {
      const data = await fetchCourseCatalog({ page, pageSize: 20, search: search || undefined });
      setCourses(data.items);
      setTotalPages(data.totalPages || 1);
    } catch (e: any) {
      console.error(e);
    }
  }, [page, search]);

  const loadCart = useCallback(async () => {
    try {
      const data = await fetchCart();
      setCart(data);
    } catch (e: any) {
      console.error(e);
      setCart(null);
    }
  }, []);

  const loadEnrollments = useCallback(async () => {
    try {
      const data = await fetchEnrollments();
      setEnrollments(data);
    } catch (e: any) {
      console.error(e);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadStatus(), loadCart()]);
    setLoading(false);
  }, [loadStatus, loadCart]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (tab === 'browse') loadCourses();
    if (tab === 'cart') loadCart();
    if (tab === 'enrollments') loadEnrollments();
  }, [tab, loadCourses, loadCart, loadEnrollments]);

  // Actions
  const handleAddToCart = async (courseId: number, sectionId: number) => {
    setActionLoading(true);
    try {
      const res = await addToCart({ courseId, sectionId });
      showToast(res.message || 'Course added to cart', 'success');
      loadCart();
      loadStatus();
    } catch (e: any) {
      showToast(e.message || 'Failed to add course', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFromCart = async (cartItemId: number) => {
    setActionLoading(true);
    try {
      const res = await removeFromCart(cartItemId);
      showToast(res.message || 'Item removed from cart', 'info');
      loadCart();
      loadStatus();
    } catch (e: any) {
      showToast(e.message || 'Failed to remove item', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    setActionLoading(true);
    try {
      const res = await clearCart();
      showToast(res.message || 'Cart cleared', 'info');
      loadCart();
      loadStatus();
    } catch (e: any) {
      showToast(e.message || 'Failed to clear cart', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!cart?.cartId) return;
    setActionLoading(true);
    try {
      const res = await confirmRegistration(cart.cartId);
      showToast(res.message || 'Registration confirmed!', 'success');
      setTab('enrollments');
      loadStatus();
    } catch (e: any) {
      showToast(e.message || 'Failed to confirm registration', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDropCourse = async (enrollmentId: number) => {
    if (!confirm('Are you sure you want to drop this course?')) return;
    setActionLoading(true);
    try {
      const res = await dropCourse(enrollmentId);
      showToast(res.message || 'Course dropped', 'warning');
      loadEnrollments();
      loadStatus();
    } catch (e: any) {
      showToast(e.message || 'Failed to drop course', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveWaitlist = async (enrollmentId: number) => {
    if (!confirm('Are you sure you want to leave the waitlist?')) return;
    setActionLoading(true);
    try {
      const res = await leaveWaitlist(enrollmentId);
      showToast(res.message || 'Removed from waitlist', 'info');
      loadEnrollments();
      loadStatus();
    } catch (e: any) {
      showToast(e.message || 'Failed to leave waitlist', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading registration data...</div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white z-50 flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600' : 
          toast.type === 'error' ? 'bg-rose-600' : 
          toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-600'
        }`}>
          <i className="ri-information-line text-lg"></i>
          <span className="font-medium text-sm">{toast.msg}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Registration Portal
            {status?.isRegistrationOpen ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold tracking-wide">OPEN</span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold tracking-wide">CLOSED</span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {status?.studentName} ({status?.studentCode}) • {status?.semesterName}
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
          <button onClick={() => setTab('overview')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Overview</button>
          <button onClick={() => setTab('browse')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'browse' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Browse Courses</button>
          <button onClick={() => setTab('cart')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${tab === 'cart' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
            Cart
            {cart?.summary.totalCourses ? <span className="bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cart.summary.totalCourses}</span> : null}
          </button>
          <button onClick={() => setTab('enrollments')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'enrollments' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>My Enrollments</button>
        </div>
      </div>

      {tab === 'overview' && status && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Credit Hours Summary</h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-600">Current Registered</span>
                  <span className="font-bold text-slate-800">{status.creditHoursSummary.currentCredits} / {status.creditHoursSummary.maxAllowedCredits}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                  <div className="bg-blue-500 h-3" style={{ width: `${(status.creditHoursSummary.registeredCredits / status.creditHoursSummary.maxAllowedCredits) * 100}%` }}></div>
                  <div className="bg-amber-400 h-3" style={{ width: `${(status.creditHoursSummary.pendingCredits / status.creditHoursSummary.maxAllowedCredits) * 100}%` }}></div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Enrolled: {status.creditHoursSummary.registeredCredits}</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Pending (Cart): {status.creditHoursSummary.pendingCredits}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Minimum Required</p>
                  <p className="text-xl font-bold text-slate-800">{status.creditHoursSummary.minRequiredCredits} credits</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium uppercase mb-1">Remaining Capacity</p>
                  <p className="text-xl font-bold text-slate-800">{status.creditHoursSummary.remainingCreditCapacity} credits</p>
                </div>
              </div>
            </div>

            {status.notifications && status.notifications.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <i className="ri-notification-3-line text-blue-600"></i> Alerts & Messages
                </h2>
                <div className="space-y-3">
                  {status.notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-xl border flex gap-3 ${
                      n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                      n.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                      'bg-blue-50 border-blue-200 text-blue-800'
                    }`}>
                      <i className={`ri-information-fill text-xl`}></i>
                      <div className="text-sm">{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-blue-100 font-medium mb-1">Registration Status</h3>
                <p className="text-2xl font-bold mb-4">{status.registrationStatusDisplay}</p>
                <div className="space-y-2 text-sm text-blue-50">
                  <div className="flex justify-between border-b border-blue-500/50 pb-2">
                    <span>Closes on</span>
                    <span className="font-medium">{fmtDate(status.registrationCloseDate)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Time Remaining</span>
                    <span className="font-medium">{status.daysRemaining} days</span>
                  </div>
                </div>
              </div>
              <i className="ri-calendar-event-line absolute -bottom-6 -right-6 text-9xl text-blue-500 opacity-30"></i>
            </div>
            
            <button 
              onClick={() => setTab('browse')}
              disabled={!status.isRegistrationOpen}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl font-medium transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              <i className="ri-search-eye-line"></i> Browse Courses
            </button>
            <button 
              onClick={() => setTab('cart')}
              className="w-full py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-medium transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              <i className="ri-shopping-cart-2-line"></i> View Cart ({status.cartItems.length})
            </button>
          </div>
        </div>
      )}

      {tab === 'browse' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Search course code or name..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadCourses()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button onClick={loadCourses} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">Search</button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {courses.map(course => {
              const prereqsMet = course.prerequisites.every(p => p.completed);
              return (
                <div key={course.courseId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{course.departmentName}</span>
                      <h3 className="text-lg font-bold text-slate-800 mt-2">{course.courseCode} - {course.courseName}</h3>
                    </div>
                    <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                      {course.creditHours} Credits
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 flex-1">{course.courseDescription}</p>
                  
                  {course.prerequisites.length > 0 && (
                    <div className={`mb-4 p-3 rounded-xl border text-sm ${prereqsMet ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                      <p className="font-semibold flex items-center gap-1 mb-1">
                        <i className={`ri-${prereqsMet ? 'checkbox-circle-fill' : 'error-warning-fill'}`}></i> Prerequisites:
                      </p>
                      <ul className="list-disc list-inside">
                        {course.prerequisites.map(p => (
                          <li key={p.courseId} className={p.completed ? 'text-emerald-600' : 'text-amber-600 font-medium'}>
                            {p.courseCode} - {p.courseName} {p.completed ? '(Completed)' : '(Required)'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 border-b pb-2">Available Sections</h4>
                    {course.sections.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No sections available.</p>
                    ) : (
                      course.sections.map(sec => {
                        const isWaitlist = sec.isFull;
                        return (
                          <div key={sec.sectionId} className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                            <div className="flex-1 min-w-[200px]">
                              <div className="font-bold text-slate-800 mb-1">{sec.sectionName} <span className="text-slate-500 font-normal">({sec.instructorName})</span></div>
                              <div className="text-slate-500 text-xs flex gap-3">
                                <span><i className="ri-calendar-line mr-1"></i>{sec.schedule.days.join(', ')}</span>
                                <span><i className="ri-time-line mr-1"></i>{sec.schedule.startTime} - {sec.schedule.endTime}</span>
                                <span><i className="ri-map-pin-line mr-1"></i>{sec.schedule.room}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-xs">
                                {isWaitlist ? (
                                  <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-md block mb-1">Waitlist Only</span>
                                ) : (
                                  <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-md block mb-1">{sec.availableSeats} Seats Left</span>
                                )}
                                <span className="text-slate-400">{sec.enrolled}/{sec.capacity} Enrolled</span>
                              </div>
                              <button 
                                onClick={() => handleAddToCart(course.courseId, sec.sectionId)}
                                disabled={!status?.isRegistrationOpen || !prereqsMet || actionLoading}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap ${
                                  isWaitlist 
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {isWaitlist ? 'Join Waitlist' : 'Add to Cart'}
                              </button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded bg-white border border-slate-200 text-sm disabled:opacity-50">Prev</button>
              <span className="px-4 py-1.5 rounded bg-slate-100 text-sm font-medium">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded bg-white border border-slate-200 text-sm disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}

      {tab === 'cart' && cart && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <i className="ri-shopping-cart-2-line"></i> My Registration Cart
            </h2>
            {cart.items.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                <i className="ri-shopping-cart-line text-4xl text-slate-300 mb-3 block"></i>
                <h3 className="text-lg font-medium text-slate-600 mb-1">Your cart is empty</h3>
                <p className="text-sm text-slate-400 mb-4">Browse courses and add them to your cart to register.</p>
                <button onClick={() => setTab('browse')} className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors">Browse Courses</button>
              </div>
            ) : (
              cart.items.map(item => (
                <div key={item.cartItemId} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${
                        item.willEnrollAs === 'Waitlisted' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.willEnrollAs} {item.waitlistPosition ? `(#${item.waitlistPosition})` : ''}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{item.creditHours} CR</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{item.courseCode} - {item.courseName}</h3>
                    <p className="text-sm text-slate-600 mb-2">{item.sectionName} • {item.instructorName}</p>
                    <div className="text-slate-500 text-xs flex flex-wrap gap-x-4 gap-y-1">
                      <span><i className="ri-calendar-line mr-1"></i>{item.schedule.days.join(', ')}</span>
                      <span><i className="ri-time-line mr-1"></i>{item.schedule.startTime} - {item.schedule.endTime}</span>
                      <span><i className="ri-map-pin-line mr-1"></i>{item.schedule.room}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveFromCart(item.cartItemId)}
                    disabled={actionLoading}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                    title="Remove from Cart"
                  >
                    <i className="ri-delete-bin-line text-lg"></i>
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-6">
              <h3 className="text-base font-bold text-slate-800 mb-4 border-b pb-3">Registration Summary</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-slate-600"><span>Total Courses:</span> <span className="font-medium text-slate-800">{cart.summary.totalCourses}</span></div>
                <div className="flex justify-between text-slate-600"><span>Total Credits:</span> <span className="font-medium text-slate-800">{cart.summary.totalCredits}</span></div>
                <div className="flex justify-between text-slate-600"><span>Min Required:</span> <span className="font-medium text-slate-800">{cart.summary.minRequiredCredits}</span></div>
                <div className="flex justify-between text-slate-600"><span>Max Allowed:</span> <span className="font-medium text-slate-800">{cart.summary.maxAllowedCredits}</span></div>
              </div>

              {cart.items.length > 0 && (
                <div className="space-y-3 mb-6">
                  {!cart.summary.meetsMinimum && (
                    <div className="text-xs bg-amber-50 text-amber-700 p-2.5 rounded-lg border border-amber-200 flex items-start gap-2">
                      <i className="ri-alert-fill mt-0.5"></i>
                      <span>You have not met the minimum credit requirement of {cart.summary.minRequiredCredits} credits.</span>
                    </div>
                  )}
                  {!cart.summary.withinMaximum && (
                    <div className="text-xs bg-rose-50 text-rose-700 p-2.5 rounded-lg border border-rose-200 flex items-start gap-2">
                      <i className="ri-error-warning-fill mt-0.5"></i>
                      <span>You have exceeded the maximum limit of {cart.summary.maxAllowedCredits} credits.</span>
                    </div>
                  )}
                  {cart.summary.conflicts && cart.summary.conflicts.length > 0 && (
                    <div className="text-xs bg-rose-50 text-rose-700 p-2.5 rounded-lg border border-rose-200 flex items-start gap-2">
                      <i className="ri-time-line mt-0.5"></i>
                      <span>Schedule conflict detected. Please review your sections.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={handleConfirmRegistration}
                  disabled={cart.items.length === 0 || !status?.isRegistrationOpen || actionLoading || !cart.summary.withinMaximum || cart.summary.conflicts?.length > 0}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors shadow-sm flex justify-center items-center gap-2"
                >
                  <i className="ri-check-double-line"></i> Confirm Registration
                </button>
                {cart.items.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    disabled={actionLoading}
                    className="w-full py-2.5 px-4 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors"
                  >
                    Clear Entire Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'enrollments' && enrollments && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase">Total Enrolled</p>
              <p className="text-2xl font-bold text-slate-800">{enrollments.statistics.enrolledCount}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase">Waitlisted</p>
              <p className="text-2xl font-bold text-amber-600">{enrollments.statistics.waitlistedCount}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase">Total Credits</p>
              <p className="text-2xl font-bold text-blue-600">{enrollments.statistics.totalCredits}</p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase">Dropped</p>
              <p className="text-2xl font-bold text-slate-500">{enrollments.statistics.droppedCount}</p>
            </div>
          </div>

          {enrollments.enrollments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
              <i className="ri-book-read-line text-4xl text-slate-300 mb-3 block"></i>
              <h3 className="text-lg font-medium text-slate-600 mb-1">No active enrollments</h3>
              <p className="text-sm text-slate-400">You haven't registered for any courses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.enrollments.map(enr => (
                <div key={enr.enrollmentId} className={`border rounded-2xl p-5 shadow-sm relative overflow-hidden ${
                  enr.status === 0 ? 'bg-white border-emerald-200' : 
                  enr.status === 4 ? 'bg-amber-50 border-amber-200' :
                  'bg-slate-50 border-slate-200 opacity-60'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">{enr.courseCode} - {enr.courseName}</h3>
                      <p className="text-sm text-slate-600">{enr.sectionName} • {enr.instructorName}</p>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                      enr.status === 0 ? 'bg-emerald-100 text-emerald-700' : 
                      enr.status === 4 ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {ENROLLMENT_STATUS_LABELS[enr.status as keyof typeof ENROLLMENT_STATUS_LABELS]}
                      {enr.status === 4 && enr.waitlistPosition ? ` (#${enr.waitlistPosition})` : ''}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-500 space-y-1.5 mb-5 bg-white/50 p-3 rounded-xl border border-slate-100">
                    <p><i className="ri-calendar-line w-5 inline-block"></i> {enr.schedule.days.join(', ')}</p>
                    <p><i className="ri-time-line w-5 inline-block"></i> {enr.schedule.startTime} - {enr.schedule.endTime}</p>
                    <p><i className="ri-map-pin-line w-5 inline-block"></i> {enr.schedule.room}</p>
                  </div>

                  {(enr.status === 0 || enr.status === 4) && (
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                      <div className="text-xs text-slate-500">
                        {enr.canDrop && enr.dropDeadline && (
                          <span><span className="font-semibold text-rose-500">Drop Deadline:</span> {fmtDate(enr.dropDeadline)}</span>
                        )}
                      </div>
                      {enr.status === 0 && enr.canDrop && (
                        <button 
                          onClick={() => handleDropCourse(enr.enrollmentId)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Drop Course
                        </button>
                      )}
                      {enr.status === 4 && (
                        <button 
                          onClick={() => handleLeaveWaitlist(enr.enrollmentId)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          Leave Waitlist
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}