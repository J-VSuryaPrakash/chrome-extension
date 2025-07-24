import { useState } from "react";
import DailyReport from "../components/DailyReport";
import BlockedSites from "../components/BlockedSites";
import Analytics from "../components/Analytics";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("report");

  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await fetch("http://localhost:8000/api/v1/user/logout", {
      method: "POST",

      credentials: "include",
    });

    navigate("/");
  };

  const tabs = [
    { id: "report", label: "Daily Report", component: <DailyReport /> },
    { id: "chart", label: "Analytics", component: <Analytics /> },
    { id: "blocked", label: "Blocked Sites", component: <BlockedSites /> },
  ];

  return (
    <div className="min-h-screen bg-dashboard-bg flex justify-center items-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header with logout button */}

        <div className="flex justify-end mb-6">
          <button
            onClick={handleLogout}
            className="bg-dashboard-danger hover:bg-dashboard-danger-hover text-dashboard-text font-semibold px-6 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-dashboard-danger focus:ring-opacity-50 hover:cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Main dashboard container */}

        <div className="bg-dashboard-surface shadow-2xl overflow-hidden">
          {/* Tab navigation */}

          <div className="bg-dashboard-surface">
            <div className="flex justify-center gap-1 p-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`relative px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-dashboard-primary text-dashboard-text shadow-lg scale-105 hover:cursor-pointer"
                      : "bg-dashboard-surface hover:bg-dashboard-surface-hover text-dashboard-text-muted hover:text-dashboard-text hover:scale-102 hover:cursor-pointer"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}

                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-dashboard-primary rounded-xl opacity-20 animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content area */}

          <div className="p-8 min-h-[500px] bg-dashboard-surface">
            <div className="bg-dashboard-bg round-xl p-6 h-full">
              {tabs.find((tab) => tab.id === activeTab)?.component}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
