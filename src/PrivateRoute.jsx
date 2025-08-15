// PrivateRoute.js
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


export default function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);

    // Role-based restriction
    if (requiredRole && decoded.role !== requiredRole) {
      return <Navigate to="/unauthorized" />;
    }

    return children;
  } catch (err) {
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
}
