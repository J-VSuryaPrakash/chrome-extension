import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const response = await fetch("http://localhost:8000/api/v1/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          email,
          password 
        }),
        credentials: "include"
      });

      const data = await response.json();
      console.log("Login response:", data);
      
      if (data.statusCode === 200) {
        // Optional: Wait a bit for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced to 1s, 3s might feel too long for a user

        // 🔐 Send WEB_PAGE_LOGIN message to the CONTENT SCRIPT via window.postMessage
        console.log("🔐 Sending login message to content script (from React app)");
        
        try {
          window.postMessage({
            type: "WEB_PAGE_LOGIN",
            payload: { /* you can include user ID, session ID, etc. if relevant */ }
          }, "*");

          console.log("✅ WEB_PAGE_LOGIN message sent successfully via window.postMessage from React app.");

          const extensionResponse = await new Promise((resolve) => {
            const messageListener = (event) => {
              if (event.source === window && event.data && event.data.type === "EXTENSION_LOGIN_RESPONSE") {
                window.removeEventListener("message", messageListener);
                resolve(event.data);
              }
            };
            window.addEventListener("message", messageListener);

            setTimeout(() => {
              window.removeEventListener("message", messageListener);
              resolve({ success: false, error: "Extension sync timed out" });
            }, 5000); // 5 seconds timeout for extension response
          });

          if (extensionResponse?.success) {
            console.log("✅ Extension login sync successful (reported by content script)");
          } else {
            console.warn("❌ Extension login sync failed (reported by content script):", extensionResponse?.error);
          }
        } catch (communicationError) {
          console.warn("Error sending or receiving message from content script:", communicationError);
        }

        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error (fetching from backend):", err);
      setError("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-950 flex justify-center items-center p-4">
      <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200">
        {/* Decorative background elements (optional, can be adjusted or removed) */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-blob opacity-70"></div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-400/10 rounded-full blur-xl animate-blob animation-delay-2000 opacity-70"></div>
        
        <h1 className="text-3xl font-extrabold mb-6 text-center text-slate-800">
          Welcome Back!
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 text-center shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-slate-700 placeholder-slate-400"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-slate-700 placeholder-slate-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none hover:cursor-pointer"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6 mb-4">
          Don't have an account?
        </p>
        <button
          onClick={() => navigate("/register")}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-md shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none hover:cursor-pointer"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}

export default Login;