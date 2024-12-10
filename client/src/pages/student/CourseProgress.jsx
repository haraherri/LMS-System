import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useGetCourseProgressQuery,
  useMarkAsCompletedMutation,
  useMarkAsInCompletedMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { Check, CheckCircle, CheckCircle2, CirclePlay } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseProgress = () => {
  const [currentLecture, setCurrentLecture] = useState(null);
  const params = useParams();
  const { courseId } = params;
  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [
    completeCourse,
    { data: markCompletedData, isSuccess: markCompletedIsSuccess },
  ] = useMarkAsCompletedMutation();
  const [
    inCompleteCourse,
    { data: markInCompletedData, isSuccess: markInCompletedIsSuccess },
  ] = useMarkAsInCompletedMutation();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load course details</p>;

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  const initialLecture =
    currentLecture || (courseDetails.lectures && courseDetails?.lectures[0]);

  const isLectureCompleted = (lectureId) => {
    return progress?.some(
      (lecture) => lecture.lectureId._id === lectureId && lecture.viewed
    );
  };

  const currentIndex = currentLecture
    ? courseDetails.lectures.findIndex(
        (lecture) => lecture._id === currentLecture._id
      )
    : 0;

  const handleLectureClick = (lecture) => {
    setCurrentLecture(lecture);
  };

  const handleUpdateLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };

  const handleMarkAsCompleted = async () => {
    try {
      const result = await completeCourse(courseId).unwrap();
      await refetch(); // Đợi refetch hoàn thành
      toast.success(result.message || "Course marked as completed");
    } catch (error) {
      toast.error(error?.data?.error || "Failed to mark as completed");
    }
  };

  const handleMarkAsInCompleted = async () => {
    try {
      const result = await inCompleteCourse(courseId).unwrap();
      await refetch();
      toast.success(result.message || "Course marked as incompleted");
    } catch (error) {
      toast.error(error?.data?.error || "Failed to mark as incompleted");
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-4 mt-20">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{courseTitle}</h1>
        <Button
          onClick={completed ? handleMarkAsInCompleted : handleMarkAsCompleted}
          variant={completed ? "outline" : "default"}
        >
          {completed ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> <span>Completed</span>
            </div>
          ) : (
            "Mark as Completed"
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
          <div>
            <video
              src={currentLecture?.videoUrl || initialLecture.videoUrl}
              controls
              className="w-full h-auto md:rounded-lg"
              onEnded={() =>
                handleUpdateLectureProgress(
                  currentLecture?._id || initialLecture._id
                )
              }
            />
          </div>
          <div className="mt-2">
            <h3 className="font-medium text-lg">
              {`Lecture ${currentIndex + 1} : ${
                currentLecture?.lectureTitle || initialLecture.lectureTitle
              }`}
            </h3>
          </div>
        </div>
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Lecture</h2>
          <div className="flex-1 overflow-y-auto">
            {courseDetails?.lectures.map((lecture) => (
              <Card
                key={lecture._id}
                className={`mb-3 hover:cursor-pointer transition transform ${
                  lecture._id === currentLecture?._id
                    ? "bg-gray-200"
                    : "dark:bg-gray-800"
                } `}
                onClick={() => handleLectureClick(lecture)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    {isLectureCompleted(lecture._id) ? (
                      <CheckCircle2 size={24} className="text-green-500 mr-2" />
                    ) : (
                      <CirclePlay size={24} className="text-gray-500 mr-2" />
                    )}
                    <div>
                      <CardTitle className="text-lg font-medium">
                        {lecture.lectureTitle}
                      </CardTitle>
                    </div>
                  </div>
                  {isLectureCompleted(lecture._id) && (
                    <Badge
                      variant={"outline"}
                      className="bg-green-200 text-green-600"
                    >
                      Completed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;
