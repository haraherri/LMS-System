import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useGetCourseProgressQuery,
  useMarkAsCompletedMutation,
  useMarkAsInCompletedMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import {
  CheckCircle,
  CheckCircle2,
  CircleEllipsis,
  CircleUser,
  PlayCircle,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import ReactPlayer from "react-player";
import parse from "html-react-parser";

const CourseProgress = () => {
  const [currentSection, setCurrentSection] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const params = useParams();
  const { courseId } = params;
  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse] = useMarkAsCompletedMutation();
  const [inCompleteCourse] = useMarkAsInCompletedMutation();
  const playerRef = useRef(null);

  useEffect(() => {
    if (data && data.data.courseDetails.sections.length > 0) {
      if (!currentSection) {
        setCurrentSection(data.data.courseDetails.sections[0]);
      }
      if (!currentLecture) {
        setCurrentLecture(data.data.courseDetails.sections[0].lectures[0]);
      }
    }
  }, [data, currentSection, currentLecture]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <CircleEllipsis className="w-12 h-12 animate-spin text-gray-600" />
      </div>
    );
  if (isError)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-500">
          Failed to load course details. Please try again later.
        </p>
      </div>
    );

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle, subTitle, description, category, creator } =
    courseDetails;

  const isLectureCompleted = (lectureId) => {
    return progress?.some(
      (lecture) => lecture.lectureId._id === lectureId && lecture.viewed
    );
  };

  const handleLectureClick = (lecture, section) => {
    setCurrentLecture(lecture);
    setCurrentSection(section);
  };

  const handleUpdateLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };

  const handleMarkAsCompleted = async () => {
    try {
      const result = await completeCourse(courseId).unwrap();
      await refetch();
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

  const handleProgress = ({ playedSeconds }) => {
    if (playedSeconds >= 3 && !isLectureCompleted(currentLecture._id)) {
      handleUpdateLectureProgress(currentLecture._id);
    }
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const calculateCompletedLectures = (section) => {
    return section.lectures.filter((lecture) => isLectureCompleted(lecture._id))
      .length;
  };

  // Sử dụng độ dài ký tự để xác định việc hiển thị nút
  const descriptionCharacterLimit = 200; // Giới hạn ký tự hiển thị ban đầu
  const shouldShowMoreButton =
    description && description.length > descriptionCharacterLimit;

  return (
    <div className="pt-16 md:pt-24 p-4 md:p-8">
      {" "}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200">
            {courseTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{subTitle}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge>{category}</Badge>
            <div className="flex items-center gap-2">
              <CircleUser size={18} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {creator.username}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
              <div className="h-[250px] md:h-[350px]">
                <ReactPlayer
                  ref={playerRef}
                  url={currentLecture?.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={true}
                  onProgress={handleProgress}
                  config={{
                    file: {
                      attributes: {
                        controlsList: "nodownload",
                      },
                    },
                  }}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">
                  {`Section ${
                    courseDetails.sections.findIndex(
                      (sec) => sec._id === currentSection?._id
                    ) + 1
                  } - ${currentSection?.sectionTitle} : Lecture ${
                    currentSection?.lectures.findIndex(
                      (lec) => lec._id === currentLecture?._id
                    ) + 1
                  } - ${currentLecture?.lectureTitle}`}
                </CardTitle>
                <CardDescription>
                  {/* Hiển thị nội dung dựa vào độ dài ký tự và trạng thái showFullDescription */}
                  {shouldShowMoreButton ? (
                    <>
                      {showFullDescription
                        ? parse(description)
                        : parse(
                            description.substring(
                              0,
                              descriptionCharacterLimit
                            ) + "..."
                          )}
                      <Button
                        variant="link"
                        className="p-0 text-blue-500"
                        onClick={toggleDescription}
                      >
                        {showFullDescription ? "Show less" : "Show more"}
                      </Button>
                    </>
                  ) : (
                    parse(description)
                  )}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={
                    completed ? handleMarkAsInCompleted : handleMarkAsCompleted
                  }
                  variant={completed ? "outline" : "default"}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {completed ? (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />{" "}
                      <span>Completed</span>
                    </div>
                  ) : (
                    "Mark as Completed"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle className="text-xl">Course Content</CardTitle>
                <CardDescription>
                  {courseDetails.sections.length} Sections -{" "}
                  {courseDetails.sections.reduce(
                    (acc, section) => acc + section.lectures.length,
                    0
                  )}{" "}
                  Lectures
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-gray-200 dark:divide-gray-700">
                <Accordion type="single" collapsible className="w-full">
                  {courseDetails?.sections.map((section, index) => (
                    <AccordionItem key={section._id} value={section._id}>
                      <AccordionTrigger
                        onClick={() => setCurrentSection(section)}
                        className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">
                            Section {index + 1}: {section.sectionTitle}
                          </span>
                          {/* Hiển thị số lecture đã hoàn thành / tổng số lecture */}
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto flex-shrink-0">
                            {calculateCompletedLectures(section)}/
                            {section.lectures.length}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 py-3">
                        {section.lectures.map((lecture) => (
                          <div
                            key={lecture._id}
                            onClick={() => handleLectureClick(lecture, section)}
                            className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              lecture._id === currentLecture?._id
                                ? "bg-gray-100 dark:bg-gray-700"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isLectureCompleted(lecture._id) ? (
                                <CheckCircle2
                                  size={18}
                                  className="text-green-500"
                                />
                              ) : (
                                <PlayCircle
                                  size={18}
                                  className="text-gray-500"
                                />
                              )}
                              <span
                                className={`text-sm ${
                                  isLectureCompleted(lecture._id)
                                    ? "text-gray-500 line-through"
                                    : "text-gray-800 dark:text-gray-300"
                                }`}
                              >
                                {lecture.lectureTitle}
                              </span>
                            </div>
                            {isLectureCompleted(lecture._id) && (
                              <Badge
                                variant={"outline"}
                                className="bg-green-200 text-green-600 text-xs"
                              >
                                Completed
                              </Badge>
                            )}
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;
