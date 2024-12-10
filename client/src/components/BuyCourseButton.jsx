import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const BuyCourseButton = ({ courseId }) => {
  const [
    createCheckoutSession,
    { data, isLoading, isSuccess, isError, error },
  ] = useCreateCheckoutSessionMutation();

  const purchaseCourseHandler = async () => {
    await createCheckoutSession({ courseId });
  };

  useEffect(() => {
    if (isSuccess) {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Invalid response from server");
      }
    }
    if (isError) {
      toast.error(error?.data?.error || "An error occurred");
    }
  }, [data, isSuccess, isError, error]);

  return (
    <Button
      size="lg"
      className="w-full text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition-all duration-300"
      disabled={isLoading}
      onClick={purchaseCourseHandler}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
          <span className="text-white">Processing...</span>
        </div>
      ) : (
        <span className="font-semibold">Purchase Course</span>
      )}
    </Button>
  );
};

export default BuyCourseButton;
