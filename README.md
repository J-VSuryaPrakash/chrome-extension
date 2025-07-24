
# 🚀 Productivity Tracker - Chrome Extension

A full-stack productivity Chrome extension that:
- ⏱️ Tracks time spent on websites
- 🛑 Blocks distracting sites
- 🗃️ Persists data locally across sessions
- 🔐 Syncs data to a backend on user login
- 📊 Includes a React-based frontend dashboard

> ❗ This extension is **not published to the Chrome Web Store**. You must load it manually via Developer Mode.

---

## 🧰 Tech Stack

- **Chrome Extension** (Manifest v3, background.js, declarativeNetRequest)
- **React.js Frontend** (Login, Dashboard, Daily Report, Blocked Sites, Analytics)
- **Node.js Backend** (API for user auth, blocking logic, tracking sync)
- **MySQL / MongoDB** (for storing user and tracking data)

---

## 🔧 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/productivity-tracker-extension.git
cd productivity-tracker-extension
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

> Update environment variables like database URL, JWT secret, and CORS if needed in `.env`.

### 3. Run the Backend Server

```bash
npm start
```

Runs on [http://localhost:8000](http://localhost:8000) by default.

---

### 4. Install Frontend (React Dashboard)

```bash
cd ../frontend
npm install
```

### 5. Start Frontend

```bash
npm run dev
```

Runs on [http://localhost:5173](http://localhost:5173)

---

### 6. Load the Extension Locally

1. Open **Google Chrome**
2. Go to `chrome://extensions/`
3. Enable **Developer Mode** (top right)
4. Click **“Load unpacked”**
5. Select the `extension/` folder (it should contain `manifest.json`, `background.js`, etc.)
6. You’re good to go!

✅ The extension will now:
- Start tracking time per website
- Block listed websites
- Store data persistently in `chrome.storage.local`
- Sync to backend after login

---

## ✨ Features

- 🔐 User Login / Register
- 📊 Track websites and duration
- 🚫 Block unwanted domains (e.g. youtube.com, instagram.com)
- ☁️ Sync tracked data to the database
- 📈 Visualize site usage and patterns in the React dashboard

---

## 📝 Notes

- Make sure your backend supports **CORS** and **cookies** (`credentials: include`) for session-based auth
- This app requires **Persistent Service Worker** behavior. Do not reload extension too frequently during dev.
- Sync happens after login via a `chrome.runtime.sendMessage({ type: "USER_LOGIN" })` call.
