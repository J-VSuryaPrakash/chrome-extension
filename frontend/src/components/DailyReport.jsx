import { useState, useEffect } from 'react';

function DailyReport() {
  const [reportData, setReportData] = useState([]);
  const [totalTime, setTotalTime] = useState(0);

  const selectedDate = new Date().toISOString().split("T")[0]

  const getDailyReport = async () => {
    const res = await fetch(`http://localhost:8000/api/v1/reports/get-daily-report?date=${selectedDate}`,{
      method: "GET",
      credentials: "include"
    });
    
    if (res.status === 200) {
      const resData = await res.json();
      const visited = resData?.data?.visitedSite || [];

      setReportData(visited);

      const total = visited.reduce((sum, site) => sum + site.timeSpent, 0);
      setTotalTime(total);
    }
  };

  useEffect(() => {
    getDailyReport();
  }, []);

  return (
    <div className="p-6 bg-blue-50">
      <h1 className="text-2xl font-bold mb-4 text-black">📊 Daily Report</h1>

      {reportData.length === 0 ? (
        <p className="text-yellow-600">No activity tracked for today.</p>
      ) : (
        <div className="space-y-4">
          {reportData.map((site, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-blue-200 p-4 rounded shadow"
            >
              <h3 className="text-black text-lg">{site.siteName}</h3>
              <p className="text-red-600">{site.timeSpent} mins</p>
            </div>
          ))}

          {/* Total time at the bottom */}
          <div className="flex justify-between items-center bg-blue-300 p-4 rounded shadow mt-4">
            <h3 className="text-black font-semibold text-lg">Total Time Spent</h3>
            <p className="text-white font-bold">{totalTime} mins</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyReport;
