import { useState } from 'react';
import DailyReport from '../components/DailyReport';
import BlockedSites from '../components/BlockedSites';
import Analytics from '../components/Analytics';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

function Dashboard() {
    const [activeTab, setActiveTab] = useState("report");
    const navigate = useNavigate(); // Initialize useNavigate

    const handleLogout = async() => {
        const response = await fetch("http://localhost:8000/api/v1/user/logout", {
            method: "POST",
            credentials: "include",
        });
        navigate('/');
    };

    return (
        <>
            <div className='w-screen h-screen bg-blue-950 flex justify-center items-center'>
                <div className="container mx-auto px-4 py-6 max-w-4xl border border-gray-300 relative"> {/* Added 'relative' here */}
                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="absolute top-4 right-4 bg-red-500 rounded-lg px-4 py-2 text-white font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 hover:cursor-pointer"
                    >
                        Logout
                    </button>

                    <div className="flex justify-around mt-8"> {/* Added mt-8 to push content below logout button */}
                        <button
                            className={`rounded-2xl border px-3 py-2 text-white font-bold font-mono hover:cursor-pointer ${
                                activeTab === "report" ? "bg-blue-600 border-blue-400" : "bg-blue-500 border-blue-300 hover:bg-blue-600"
                            }`}
                            onClick={() => setActiveTab("report")}
                        >
                            Daily Report
                        </button>
                        <button
                            className={`rounded-2xl border px-3 py-2 text-white font-bold font-mono hover:cursor-pointer ${
                                activeTab === "chart" ? "bg-blue-600 border-blue-400" : "bg-blue-500 border-blue-300 hover:bg-blue-600"
                            }`}
                            onClick={() => setActiveTab("chart")}
                        >
                            Analytics
                        </button>
                        <button
                            className={`rounded-2xl border px-3 py-2 text-white font-bold font-mono hover:cursor-pointer ${
                                activeTab === "blocked" ? "bg-blue-600 border-blue-400" : "bg-blue-500 border-blue-300 hover:bg-blue-600"
                            }`}
                            onClick={() => setActiveTab("blocked")}
                        >
                            Blocked Sites
                        </button>
                    </div>

                    <div className='flex justify-center mt-5 border border-gray-300'>
                        {activeTab === "report" && <DailyReport />}
                        {activeTab === "blocked" && <BlockedSites />}
                        {activeTab === "chart" && <Analytics />}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;