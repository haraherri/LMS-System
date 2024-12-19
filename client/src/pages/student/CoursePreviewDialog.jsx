import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ReactPlayer from "react-player";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const CoursePreviewDialog = ({ isOpen, onClose, lectures }) => {
  // Check if any lecture is free
  const hasFreeLectures = lectures.some((lecture) => lecture.isPreviewFree);

  // Initialize selectedLectureIndex based on whether there are free lectures
  const [selectedLectureIndex, setSelectedLectureIndex] = useState(
    hasFreeLectures ? lectures.findIndex((lecture) => lecture.isPreviewFree) : 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] max-h-[95vh] overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4">
        {/* Title */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Course Preview
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Conditional Rendering based on hasFreeLectures */}
          {hasFreeLectures ? (
            <>
              {/* Video Player */}
              <div className="w-full md:w-2/3">
                {lectures[selectedLectureIndex]?.videoUrl && (
                  <div className="relative aspect-w-16 aspect-h-9">
                    <ReactPlayer
                      url={lectures[selectedLectureIndex].videoUrl}
                      controls={true}
                      width="100%"
                      height="100%"
                      config={{
                        file: {
                          attributes: {
                            controlsList: "nodownload",
                            className: "rounded-lg overflow-hidden",
                          },
                        },
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                )}
                <DialogDescription className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {lectures[selectedLectureIndex]?.lectureTitle}
                </DialogDescription>
              </div>

              {/* Lecture List */}
              <div className="w-full md:w-1/3 space-y-3 overflow-y-auto max-h-[350px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                {lectures.map((lecture, index) => (
                  <div
                    key={index}
                    className={`group flex items-center p-3 rounded-lg cursor-pointer transition duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      index === selectedLectureIndex
                        ? "bg-gray-100 dark:bg-gray-800 shadow-md"
                        : ""
                    }`}
                    onClick={() => {
                      if (lecture.isPreviewFree) {
                        setSelectedLectureIndex(index);
                      }
                    }}
                  >
                    <div className="flex-grow flex items-center gap-2.5">
                      <CheckCircle2
                        className={`h-5 w-5 shrink-0 ${
                          index === selectedLectureIndex
                            ? "text-blue-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      />
                      <p
                        className={`text-sm font-medium ${
                          index === selectedLectureIndex
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        } group-hover:text-gray-900 dark:group-hover:text-white`}
                      >
                        {lecture.lectureTitle}
                      </p>
                    </div>
                    {lecture.isPreviewFree && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-100 px-2.5 py-1 rounded-full text-xs font-medium ml-auto shrink-0"
                      >
                        Preview
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* No Free Lectures Message */
            <div className="w-full text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                No Preview Available
              </h3>
              <p className="text-md text-gray-500 dark:text-gray-400 mt-2">
                There are no free previews available for this course at the
                moment.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoursePreviewDialog;
