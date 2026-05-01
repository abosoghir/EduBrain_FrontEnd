import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <i className="ri-error-warning-line text-3xl text-slate-400" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
        <p className="text-slate-500 text-sm mb-6">This page doesn't exist or has been moved.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium transition-colors whitespace-nowrap"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}