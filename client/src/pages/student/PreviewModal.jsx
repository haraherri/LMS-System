import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ReactPlayer from "react-player";
import { Lock, PlayCircle } from "lucide-react";

const PreviewModal = ({ lecture }) => {
  if (lecture.isPreviewFree) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100/50 transition-colors w-full">
            <div className="flex items-center gap-3 text-sm">
              <span>
                <PlayCircle className="h-5 w-5 text-green-500" />
              </span>
              <p className="font-medium">{lecture.lectureTitle}</p>
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] p-4 bg-white rounded-lg shadow-lg">
          <div className="relative w-full aspect-video">
            <ReactPlayer
              width="100%"
              height="100%"
              url={lecture.videoUrl}
              controls={true}
              config={{
                file: {
                  attributes: {
                    controlsList: "nodownload",
                  },
                },
              }}
              onContextMenu={(e) => e.preventDefault()}
              playing
              className="absolute top-0 left-0"
            />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {lecture.lectureTitle}
            </h3>
            <p className="text-sm text-gray-600">
              Preview of the lecture content.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  } else {
    return (
      <div className="flex items-center justify-between p-2 w-full select-text">
        <div className="flex items-center gap-3 text-sm">
          <span>
            <Lock className="h-5 w-5 text-gray-500" />
          </span>
          <p className="text-gray-500">{lecture.lectureTitle}</p>
        </div>
      </div>
    );
  }
};

export default PreviewModal;
