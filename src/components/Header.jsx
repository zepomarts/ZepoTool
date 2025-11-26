import React from "react";

export default function Header({ title, subtitle }) {
  return (
    <div className="mb-6 sticky top-0 z-20 bg-transparent">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1f3a8a]">{title}</h1>
          {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-sm text-gray-600">Welcome, Admin</div>
          <button className="px-4 py-2 btn-primary shadow-soft">New Report</button>
        </div>
      </div>
    </div>
  );
}
