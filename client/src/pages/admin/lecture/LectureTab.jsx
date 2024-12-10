import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  useEditLectureMutation,
  useGetLectureByIdQuery,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const MEDIA_API = "http://localhost:8084/api/v1/media";

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const { courseId, lectureId } = params;

  const { data: lectureData, refetch: refetchLecture } =
    useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(() => {
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setCurrentVideoUrl(lecture.videoUrl || "");
      setUploadVideoInfo({
        videoUrl: lecture.videoUrl,
        publicId: lecture.publicId,
      });
    }
  }, [lecture]);

  const [editLecture, { data, isLoading, error, isSuccess }] =
    useEditLectureMutation();

  const [
    removeLecture,
    {
      data: removeData,
      isLoading: removeIsLoading,
      isSuccess: removeIsSuccess,
    },
  ] = useRemoveLectureMutation();

  const currentProgress = useRef(0);

  useEffect(() => {
    let interval; // Declare interval outside the if block
    if (isUploading) {
      // Only start the interval when isUploading is true
      interval = setInterval(() => {
        // Check if upload is complete within the interval
        if (currentProgress.current >= 100) {
          clearInterval(interval); // Clear interval if upload is done
          setUploadProgress(currentProgress.current); // Set to actual progress value
        } else if (currentProgress.current > uploadProgress) {
          setUploadProgress((prev) =>
            prev + 1 > currentProgress.current
              ? currentProgress.current
              : prev + 1
          );
        }
      }, 50);
    }

    return () => clearInterval(interval);
  }, [uploadProgress, isUploading, currentProgress.current]);

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      setUploadProgress(0);
      currentProgress.current = 0;
      setIsUploading(true); // Set uploading state to true

      try {
        const response = await axios.post(
          `${MEDIA_API}/upload-video`,
          formData,
          {
            onUploadProgress: ({ loaded, total }) => {
              currentProgress.current = Math.round((loaded / total) * 100);
            },
          }
        );
        if (response.data.success) {
          setUploadVideoInfo({
            videoUrl: response.data.data.url,
            publicId: response.data.data.public_id,
          });
          setBtnDisable(false);
          toast.success(response.data.message);
        }
      } catch (error) {
        toast.error(error?.response?.data?.error || "Failed to upload video");
      } finally {
        setMediaProgress(false);
        setIsUploading(false); // Reset uploading state
      }
    }
  };

  const editLectureHandler = async () => {
    await editLecture({
      lectureTitle,
      videoInfo: uploadVideoInfo,
      isPreviewFree: isFree,
      courseId,
      lectureId,
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture({ lectureId });
  };

  useEffect(() => {
    if (isSuccess) {
      refetchLecture();
      toast.success(data?.message || "Lecture updated successfully");
    }
    if (error) {
      toast.error(error?.data?.error || "Failed to update lecture");
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (removeIsSuccess) {
      toast.success(removeData?.message || "Lecture removed successfully");
      navigate(`/admin/course/${courseId}/lecture`);
    }
  }, [removeIsSuccess, courseId, navigate]);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Add detail information regarding the lecture. Make changes and save
            when done.
          </CardDescription>
        </div>
        <div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isUploading}>
                {removeIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                    wait...
                  </>
                ) : (
                  "Remove Lecture"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  lecture and remove all related data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={removeLectureHandler}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
          />
        </div>
        <div className="my-5">
          <Label>
            Video <span className="text-red-500">*</span>
          </Label>
          {currentVideoUrl && (
            <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="text-sm">
                Current video: {currentVideoUrl.split("/").pop()}{" "}
              </p>
              <Button
                variant="link"
                onClick={() => window.open(currentVideoUrl, "_blank")}
                className="p-0 h-auto text-blue-500 hover:text-blue-600"
              >
                Preview Video
              </Button>
            </div>
          )}
          <Input
            type="file"
            onChange={fileChangeHandler}
            className="w-fit"
            accept="video/*"
          />
        </div>
        <div className="flex items-center space-x-2 my-5">
          <Switch
            checked={isFree}
            onCheckedChange={setIsFree}
            id="isPreviewFree"
          />
          <Label htmlFor="isPreviewFree">is this video FREE?</Label>
        </div>
        {mediaProgress && (
          <div className="my-4">
            <Progress value={uploadProgress} />
            <p>{uploadProgress}% uploaded...</p>
          </div>
        )}
        <div className="mt-4">
          <Button
            disabled={isLoading || isUploading}
            onClick={editLectureHandler}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
export default LectureTab;
