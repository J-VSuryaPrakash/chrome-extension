import { useEffect, useState } from "react";

const COLORS = ["#14b8a6", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

function Analytics() {
  const [report, setReport] = useState(null);

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
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (!report) return <div className="text-center p-4">Loading...</div>;
  
  const totalTime = report.totalTimeSpent;
  const enrichedSites = report.visitedSite.map((site, index) => ({
    ...site,
    color: COLORS[index % COLORS.length],
    widthPercent: (site.timeSpent / totalTime) * 100,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto">
      {/* Total Time */}
      <div className="text-3xl font-bold text-black mb-4">
        {totalTime}m
      </div>

      {/* Progress Bar */}
      <div className="flex h-5 rounded-full overflow-hidden mb-6">
        {enrichedSites.map((site, index) => (
          <div
            key={index}
            style={{
              width: `${site.widthPercent}%`,
              backgroundColor: site.color,
            }}
          />
        ))}
      </div>

      {/* Site Legend */}
      <div className="space-y-3">
        {enrichedSites.map((site, index) => (
          <div key={index} className="flex justify-between items-center text-black">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: site.color }}
              />
              <span>{site.siteName}</span>
            </div>
            <span>{site.timeSpent} m</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Analytics;
