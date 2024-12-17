import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import React from "react";
import { Link } from "react-router-dom";
import { useGetCourseProgressQuery } from "@/features/api/courseProgressApi";

const levelColors = {
  Beginner: "bg-green-500",
  Intermediate: "bg-yellow-500",
  Advanced: "bg-red-500",
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const Course = ({ course, showProgress = false }) => {
  const { data: progressData, isLoading: isProgressLoading } =
    useGetCourseProgressQuery(course._id);

  const calculateProgress = () => {
    if (!progressData || !progressData.data.courseDetails) {
      return 0;
    }

    const { courseDetails, progress } = progressData.data;
    let totalLectures = 0;
    courseDetails.sections.forEach(
      (sec) => (totalLectures += sec.lectures.length)
    );

    if (totalLectures === 0) {
      return 0;
    }

    const viewedLectures = progress
      ? progress.filter((lecture) => lecture.viewed).length
      : 0;
    return Math.round((viewedLectures / totalLectures) * 100);
  };

  const progress = calculateProgress();

  return (
    <Link to={`/course-detail/${course._id}`}>
      <Card className="overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
        <div className="relative">
          <img
            src={course?.courseThumbnail}
            alt="course"
            className="w-full h-48 object-cover rounded-t-lg"
            loading="lazy"
          />
        </div>
        <CardContent className="px-5 py-4 space-y-3">
          <h2 className="hover:underline font-bold text-xl truncate">
            {course.courseTitle}
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    course?.creator
                      ? course?.creator?.photoUrl
                      : "/path/to/your/placeholder.jpg"
                  }
                  alt={course?.creator?.name || "Creator"}
                />
                <AvatarFallback>
                  {course?.creator?.name
                    ? course?.creator?.name.substring(0, 2).toUpperCase()
                    : "CN"}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-medium text-sm">
                {course?.creator?.name || "Unknown Creator"}
              </h3>
            </div>
            <Badge
              className={`${
                levelColors[course.courseLevel] || "bg-blue-600"
              } text-white px-2 py-1 text-xs rounded-full`}
            >
              {course.courseLevel}
            </Badge>
          </div>
          <div className="space-y-2">
            {showProgress &&
              (isProgressLoading ? (
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full animate-pulse"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              ) : (
                <>
                  <Progress
                    value={progress}
                    className={progress === 100 ? "progress-complete" : ""}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {progress}% Complete
                  </p>
                </>
              ))}

            {!showProgress && (
              <div className="text-lg font-bold">
                <span>{formatCurrency(course.coursePrice)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Course;
