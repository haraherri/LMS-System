import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

import { useLoadUserQuery } from "@/features/api/authApi";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const { isLoading, isError, error } = useLoadUserQuery(
    {},
    { skip: !isAuthenticated }
  );
  // `skip: !isAuthenticated` will skip the query if user is not authenticated

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div>
        Error:{" "}
        {error.data?.error || error.message || "An unexpected error occurred"}
      </div>
    );
  }

  if (!allowedRoles || allowedRoles.includes(user?.role)) {
    return children;
  }

  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
