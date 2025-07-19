import { useState, useEffect } from 'react';

function BlockedSites() {
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [blockedSites, setBlockedSites] = useState([]);

  const getBlockedSites = async () => {
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
    }
  };

  const addSite = async (e) => {
    e.preventDefault();

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
    }
  };

  const removeSite = async (sitename) => {
    
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
    }
  };

  useEffect(() => {
    getBlockedSites();
  }, []);

  return (
    <div className="p-6 bg-blue-50">
      <h1 className="text-2xl font-bold mb-4 text-black">🚫 Blocked Sites</h1>

      {/* Form */}
      <form
        onSubmit={addSite}
        className="bg-blue-100 p-4 rounded shadow-md mb-6"
      >
        <label className="block text-black font-medium mb-2">
          Add Site to Block List
        </label>
        <input
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="Site Name"
          className="w-full p-2 mb-2 border border-blue-300 rounded"
        />
        <input
          type="text"
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          placeholder="Site URL"
          className="w-full p-2 mb-4 border border-blue-300 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Site
        </button>
      </form>

      {/* Blocked Sites List */}
      <div className="space-y-4">
        {blockedSites.length === 0 ? (
          <p className="text-yellow-600">No blocked sites yet.</p>
        ) : (
          blockedSites.map((site, idx) => (          
            <div
              key={idx}
              className="flex items-center justify-between bg-blue-200 p-4 rounded shadow"
            >
              <h3 className="text-black text-lg">{site.sitename}</h3>
              <button
                onClick={() => removeSite(site.sitename)} 
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BlockedSites;
