import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center">Loading...</div>;

  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
