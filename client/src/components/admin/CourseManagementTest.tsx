import React from "react";

export default function CourseManagementTest() {
  console.log('CourseManagementTest component rendering');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Course Management Test</h2>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Test Component</h3>
        <p className="text-slate-600">This is a test component to verify the admin panel is working.</p>
      </div>
    </div>
  );
}
