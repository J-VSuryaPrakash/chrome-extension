import { useState, useEffect } from 'react';

function BlockedSites() {
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [blockedSites, setBlockedSites] = useState([]);

  const getBlockedSites = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/blocklist/get-blocked-sites", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      
      if (res.status === 200) {
        const resData = await res.json(); 
        setBlockedSites(resData.data);
      } else {
        console.error("Failed to fetch blocked sites:", res.status, res.statusText);
        setBlockedSites([]);
      }
    } catch (error) {
      console.error("Error fetching blocked sites:", error);
      setBlockedSites([]);
    }
  };

  const addSite = async (e) => {
    e.preventDefault();

    if (!siteName.trim() || !siteUrl.trim()) {
      alert("Please enter both site name and URL.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/v1/blocklist/add-site-to-block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sitename: siteName,
          siteurl: siteUrl
        }),
        credentials: "include"
      });

      if (res.status === 200) {
        const resData = await res.json();
        setBlockedSites(resData.data.blockedSites);
        setSiteName("");
        setSiteUrl("");
      } else {
        console.error("Failed to add site:", res.status, res.statusText);
        alert("Failed to add site. It might already be blocked or an error occurred.");
      }
    } catch (error) {
      console.error("Error adding site:", error);
      alert("An error occurred while adding the site.");
    }
  };

  const removeSite = async (sitename) => {
    if (!window.confirm(`Are you sure you want to unblock "${sitename}"?`)) {
      return; // User cancelled
    }
    
    try {
      const res = await fetch("http://localhost:8000/api/v1/blocklist/remove-site-from-block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ sitename }),
        credentials: "include"
      });

      if (res.status === 200) {
        getBlockedSites(); 
      } else {
        console.error("Failed to remove site:", res.status, res.statusText);
        alert("Failed to remove site.");
      }
    } catch (error) {
      console.error("Error removing site:", error);
      alert("An error occurred while removing the site.");
    }
  };

  useEffect(() => {
    getBlockedSites();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-start justify-center">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 border-b border-blue-700">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🚫 Blocked Sites Management
          </h1>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6">
          {/* Form */}
          <form onSubmit={addSite} className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-800">Add Site to Block List</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Site Name (e.g., Facebook)"
                className="flex-1 px-4 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 placeholder-slate-400"
                required
              />
              <input
                type="text"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="Site URL (e.g., facebook.com)"
                className="flex-1 px-4 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 placeholder-slate-400"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 sm:w-auto w-full transform active:scale-95"
              >
                Add Site
              </button>
            </div>
          </form>

          {/* Blocked Sites List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Currently Blocked Sites</h3>
            {blockedSites.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-lg font-medium">Nothing blocked here yet!</p>
                <p className="text-sm mt-1 text-slate-400">Add sites above to see them appear in this list.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedSites.map((site, idx) => ( 
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors duration-200 shadow-sm transform hover:scale-[1.01]"
                  >
                    <div className="flex flex-col mb-2 sm:mb-0 sm:pr-4">
                      <span className="font-semibold text-slate-800 text-lg">{site.sitename}</span>
                      <span className="text-sm text-slate-500">{site.siteurl}</span>
                    </div>
                    <button
                      onClick={() => removeSite(site.sitename)}
                      className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform active:scale-95"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockedSites;