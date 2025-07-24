import { useState, useEffect } from 'react';
import { formatTime } from '../utils/formatTime'; 

const COLORS = ["#14b8a6", "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#f97316", "#06b6d4"];

function DailyReport() {
  const [reportData, setReportData] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const selectedDate = new Date().toISOString().split("T")[0];

  const getDailyReport = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reports/get-daily-report?date=${selectedDate}`, {
        method: "GET",
        credentials: "include"
      });
      
      if (res.status === 200) {
        const resData = await res.json();
        const visited = resData?.data?.visitedSite || [];

        setReportData(visited);

        const total = visited.reduce((sum, site) => sum + site.timeSpent, 0);
        setTotalTime(total);
      } else {
        console.error("Failed to fetch daily report:", res.status, res.statusText);
        setReportData([]);
        setTotalTime(0);
      }
    } catch (error) {
      console.error("Error fetching daily report:", error);
      setReportData([]);
      setTotalTime(0);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    getDailyReport();
  }, []);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Loading daily report...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        
        {/* --- Header Section --- */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            📊 Daily Usage Report
          </h1>
          <p className="text-slate-600 text-lg">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {reportData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
            <p className="text-slate-600 font-medium">No activity tracked for today.</p>
            <p className="text-slate-400 text-sm mt-2">Start Browse to see your daily report here!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            {/* Panel Header - Added to match the Analytics component */}
            <div className="bg-slate-800 text-white p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                Today's Site Activity
              </h2>
              <span className="text-slate-300 text-sm">Summary for {selectedDate}</span>
            </div>

            {/* Panel Content */}
            <div className="p-6 sm:p-8 space-y-4">
              {reportData.map((site, idx) => (
                <div
                  key={idx}
                  className="group flex justify-between items-center p-4 rounded-lg bg-white hover:bg-slate-50 transition-all duration-200 border border-slate-200 hover:shadow-md transform hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-5 h-5 rounded-full shadow-sm border border-slate-300 group-hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">
                        {site.siteUrl}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                    {formatTime(site.timeSpent)}
                  </p>
                </div>
              ))}

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-5 rounded-xl shadow-md text-center border border-blue-200">
                  <h3 className="text-2xl font-bold text-blue-800 mb-1">Total Time Spent Today</h3>
                  <p className="text-3xl font-extrabold text-blue-900">
                    {formatTime(totalTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyReport;