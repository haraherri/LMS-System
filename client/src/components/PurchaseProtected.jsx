import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import LoadingSpinner from "@/components/LoadingSpinner";

const PurchaseProtected = ({ children }) => {
  const { courseId } = useParams();
  const { data, isLoading, isError, error } = useGetCourseDetailWithStatusQuery(
    { courseId }
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div>
        Error:{" "}
        {error.data?.error ||
          error.message ||
          "An unexpected error occurred while checking purchase status."}
      </div>
    );
  }

  if (!data || data.purchaseStatus !== "Success") {
    return <Navigate to="/" replace />; // Or to a "Not Purchased" page
  }

  return children;
};

export default PurchaseProtected;
