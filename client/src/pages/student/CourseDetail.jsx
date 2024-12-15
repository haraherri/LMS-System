import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import {
  BadgeCheck,
  BadgeInfo,
  Loader2,
  Lock,
  PlayCircle,
  Star,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import parse from "html-react-parser";
import ReactPlayer from "react-player";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSelector } from "react-redux";

const CourseDetail = () => {
  const params = useParams();
  const { courseId } = params;
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, isError } = useGetCourseDetailWithStatusQuery(
    { courseId },
    { skip: !user }
  );

  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionRef = useRef(null);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] =
    useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check if data exists before accessing descriptionRef
    if (data && descriptionRef.current) {
      setIsDescriptionOverflowing(
        descriptionRef.current.scrollHeight >
          descriptionRef.current.clientHeight
      );
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-lg font-semibold text-red-500">
          Failed to load course details
        </h1>
      </div>
    );
  }

  // Check if data exists before destructuring
  const course = data?.course;
  const purchaseStatus = data?.purchaseStatus;

  const handleContinueCourse = () => {
    if (purchaseStatus === "Success") {
      navigate(`/course-progress/${courseId}`);
    }
  };

  // Check if course exists before accessing sections
  const firstLecture = course?.sections?.[0]?.lectures?.[0];
  const previewLecture =
    firstLecture ||
    course?.sections
      ?.flatMap((section) => section.lectures)
      .find((lecture) => lecture.isPreviewFree);

  // Return null or a placeholder if data is undefined (e.g., after logout)
  if (!data) {
    return null; // Or return a placeholder component
  }

  return (
    <div className="mt-20 space-y-5 pb-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-xl">
        <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 flex flex-col gap-4">
          <h1 className="font-bold text-3xl md:text-5xl tracking-tight">
            {course?.courseTitle}
          </h1>
          <p className="text-lg md:text-xl text-indigo-100">
            {course?.subTitle}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm md:text-base">
            <p className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-green-300" />
              Created By{" "}
              <span className="font-semibold text-white">
                {course?.creator?.name}
              </span>
            </p>
            <Separator orientation="vertical" className="h-5 bg-white/50" />
            <p className="flex items-center gap-2">
              <BadgeInfo className="h-5 w-5 text-blue-300" />
              Last updated{" "}
              <span className="font-semibold text-white">
                {course?.createdAt ? course.createdAt.split("T")[0] : "N/A"}
              </span>
            </p>
            <Separator orientation="vertical" className="h-5 bg-white/50" />
            <p className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {course?.enrolledStudents.length}
              </span>{" "}
              Students
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Course Content & Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card className="p-6 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Course Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-base prose dark:prose-invert max-w-none leading-relaxed ${
                  showFullDescription ? "" : "line-clamp-5"
                }`}
                ref={descriptionRef}
              >
                {parse(course?.description || "")}
              </div>
              {isDescriptionOverflowing && (
                <Button
                  variant="link"
                  className="px-0 mt-2 text-blue-500 hover:underline"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? "Show Less" : "Show More"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Course Lectures */}
          <Card className="p-6 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Course Content
              </CardTitle>
              <CardDescription>
                {course?.sections?.reduce(
                  (total, section) => total + section.lectures.length,
                  0
                )}{" "}
                lectures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {course?.sections?.map((section, index) => (
                  <AccordionItem value={`section-${index}`} key={index}>
                    <AccordionTrigger>{section.sectionTitle}</AccordionTrigger>
                    <AccordionContent>
                      {section.lectures.map((lecture, lectureIndex) => (
                        <div
                          key={lectureIndex}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 text-sm">
                            <span>
                              {purchaseStatus === "Success" ||
                              lecture.isPreviewFree ? (
                                <PlayCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Lock className="h-5 w-5 text-gray-500" />
                              )}
                            </span>
                            <p
                              className={
                                purchaseStatus === "Success" ||
                                lecture.isPreviewFree
                                  ? "font-medium"
                                  : "text-gray-500"
                              }
                            >
                              {lecture.lectureTitle}
                            </p>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Course Preview & Purchase */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
            {/* Video Container */}
            <div className="relative w-full aspect-video">
              <ReactPlayer
                width="100%"
                height="100%"
                url={
                  purchaseStatus === "Success"
                    ? firstLecture?.videoUrl
                    : previewLecture?.videoUrl
                }
                controls={true}
                className="absolute top-0 left-0"
              />
            </div>

            {/* Card Content */}
            <div>
              <CardHeader className="bg-gray-100/50 px-6 pt-6 pb-4">
                <CardTitle className="text-lg font-bold">
                  Course Preview
                </CardTitle>
                <CardDescription className="text-gray-500 line-clamp-2">
                  {purchaseStatus === "Success"
                    ? firstLecture?.lectureTitle
                    : previewLecture?.lectureTitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-semibold">
                        ${course?.coursePrice ? course.coursePrice : "N/A"}
                      </span>
                      {course?.coursePrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${course?.coursePrice * 1.2}
                        </span>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      className="hover:bg-gray-200 transition-colors"
                    >
                      <Star className="h-4 w-4" />
                      <span className="sr-only">Add to Wishlist</span>
                    </Button>
                    {purchaseStatus === "Success" ? (
                      <Button
                        onClick={handleContinueCourse}
                        size="lg"
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center"
                      >
                        <PlayCircle className="h-5 w-5 mr-2" />
                        Continue Course
                      </Button>
                    ) : (
                      <BuyCourseButton courseId={courseId} />
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
