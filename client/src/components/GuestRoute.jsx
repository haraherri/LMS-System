import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isAuthenticated) {
    // Redirect to home page if user is already authenticated
    return <Navigate to={location.state?.from || "/"} replace />;
  }

  return children;
};

export default GuestRoute;
