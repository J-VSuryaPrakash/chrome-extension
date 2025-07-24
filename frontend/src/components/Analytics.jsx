import { useEffect, useState } from "react";
import { formatTime } from "../utils/formatTime";
const COLORS = ["#14b8a6", "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#f97316", "#06b6d4"];

function Analytics() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    const selectedDate = new Date().toISOString().split("T")[0];
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reports/get-daily-report?date=${selectedDate}`, {
        method: "GET",
        credentials: "include",
      });

      if(res.status === 200) {
        const resData = await res.json();
        setReport(resData.data || {});
      } else {
        console.error("Failed to fetch analytics:", res.status, res.statusText);
        setReport({});
      }
    } catch (error) {
      
      setReport({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  // --- No Report Data State ---
  if (!report || report.visitedSite.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
          <p className="text-slate-600 font-medium">No analytics data available for today.</p>
          <p className="text-slate-400 text-sm mt-2">Start Browse to see your insights here!</p>
        </div>
      </div>
    );
  }
  
  console.log("Analytics Report Data:", report);
  
  const totalTime = report.totalTimeSpent;
  console.log("Total Time Spent:", totalTime)
  
  const enrichedSites = report.visitedSite.map((site, index) => ({
    ...site,
    color: COLORS[index % COLORS.length],
    widthPercent: (site.timeSpent / totalTime) * 100,
  }));
  const totalHours = Math.floor(totalTime / 3600);
  const totalMinutes = Math.floor((totalTime % 3600) / 60);
  const averageTime = Math.round(totalTime / enrichedSites.length);
  console.log("Average time : ", averageTime);
  
  console.log("Formatted time: ", formatTime(averageTime));
  const topSite = enrichedSites[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        
        {/* --- Header Section --- */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Daily Usage Insights
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

        {/* --- Stats Cards Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Time Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
            <div className="text-3xl font-bold mb-1">
              {totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`}
            </div>
            <div className="text-blue-100 text-sm font-medium uppercase tracking-wider">Total Time Today</div>
          </div>

          {/* Average Time Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">           
            <div className="text-3xl font-bold mb-1">{formatTime(99)}</div>
            <div className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Average per Site</div>
          </div>

          {/* Sites Count Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
            <div className="text-3xl font-bold mb-1">{enrichedSites.length}</div>
            <div className="text-purple-100 text-sm font-medium uppercase tracking-wider">Sites Visited</div>
          </div>
        </div>

        {/* --- Main Analytics Panel --- */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-6 sm:p-8">
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-5 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
                <div className="text-3xl font-bold text-blue-700 mb-1">
                  {topSite ? Math.round(topSite.widthPercent) : 0}%
                </div>
                <div className="text-sm text-blue-800 font-medium">
                  On {topSite?.siteUrl || 'your top site'}
                </div>
              </div>

              <div className="text-center p-5 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                <div className="text-3xl font-bold text-emerald-700 mb-1">
                  {Math.round((totalTime / 60 / 480) * 100)}%
                </div>
                <div className="text-sm text-emerald-800 font-medium">
                  Of an 8-hour workday
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;