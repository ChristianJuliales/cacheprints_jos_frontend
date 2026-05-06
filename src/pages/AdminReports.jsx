import React from 'react';

export default function AdminReports() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-8">Reports</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Report */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Daily Report</h2>
            <button className="bg-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600">
              Generate PDF
            </button>
          </div>

          {/* Weekly Report */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Weekly Report</h2>
            <button className="bg-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600">
              Generate PDF
            </button>
          </div>

          {/* Monthly Report */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Monthly Report</h2>
            <button className="bg-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600">
              Generate PDF
            </button>
          </div>

          {/* Revenue Report */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Revenue Report</h2>
            <button className="bg-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600">
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
