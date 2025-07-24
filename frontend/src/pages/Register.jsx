import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Add error state for feedback
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Basic client-side validation
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
        setError("All fields are required.");
        return;
    }
    if (password.length < 6) { // Example password strength
        setError("Password must be at least 6 characters long.");
        return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/v1/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name, username, email, password
        })
      });

      if (response.ok) { // Check if the response status is 2xx
        const resData = await response.json();
        console.log("Registration response:", resData);
        if (resData.statusCode === 200) {
          alert("Registration successful! Please log in."); // User-friendly alert
          navigate("/"); // Navigate to login page after successful registration
        } else {
          setError(resData.message || "Registration failed. Please try again.");
          console.error("Registration failed:", resData.message);
        }
      } else {
        const errorData = await response.json(); // Parse error response
        setError(errorData.message || "Registration failed. Please try again.");
        console.error("Server error during registration:", response.status, errorData);
      }
    } catch (err) {
      console.error("Network or unexpected error during registration:", err);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-950 flex justify-center items-center p-4">
      <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200">
        {/* Decorative background elements (optional, can be adjusted or removed) */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-blob opacity-70"></div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-400/10 rounded-full blur-xl animate-blob animation-delay-2000 opacity-70"></div>
        
        <h1 className="text-3xl font-extrabold mb-6 text-center text-slate-800">
          Join Us!
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 text-center shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-slate-700 placeholder-slate-400"
              required
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-slate-700 placeholder-slate-400"
              required
            />
          </div>
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
              placeholder="Create your password"
              className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-slate-700 placeholder-slate-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Register Account
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6 mb-4">
          Already have an account?
        </p>
        <button
          onClick={() => navigate("/")}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-md shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Login Here
        </button>
      </div>
    </div>
  );
}

export default Register;