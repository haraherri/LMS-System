import RichTextEditor from "@/components/RichTextEditor";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEditCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation,
  useRemoveCourseMutation,
} from "@/features/api/courseApi";
import { Image, Loader2, Trash2, XCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { use } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseTab = () => {
  const [input, setInput] = useState({
    courseTitle: "",
    subTitle: "",
    category: "",
    courseLevel: "",
    coursePrice: "",
    courseThumbnail: "",
  });
  const [descriptionContent, setDescriptionContent] = useState("");

  const fileInputRef = useRef(null);
  const params = useParams();
  const courseId = params.courseId;

  const {
    data: courseByIdData,
    isLoading: courseByIdLoading,
    refetch,
  } = useGetCourseByIdQuery(courseId);

  const [publishCourse, {}] = usePublishCourseMutation();

  const [removeCourse, { isLoading: removeLoading }] =
    useRemoveCourseMutation();

  useEffect(() => {
    if (courseByIdData?.course) {
      const course = courseByIdData.course;
      setDescriptionContent(course.description || ""); // Set riêng description

      setInput({
        // Các trường còn lại, không có description
        courseTitle: course.courseTitle || "",
        subTitle: course.subTitle || "",
        category: course.category || "",
        courseLevel: course.courseLevel || "",
        coursePrice: course.coursePrice?.toString() || "",
      });

      // Set preview thumbnail if exists
      if (course.courseThumbnail) {
        setPreviewThumbnail(course.courseThumbnail);

        if (fileInputRef.current) {
          const fileName = course.courseThumbnail.split("/").pop();
          const dataTransfer = new DataTransfer();
          const file = new File([], fileName, { type: "image/*" });
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
        }
      }
    }
  }, [courseByIdData]);

  useEffect(() => {
    refetch();
  }, []);

  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const navigate = useNavigate();

  const [editCourse, { data, isLoading, isSuccess, error }] =
    useEditCourseMutation();

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const selectCategory = (value) => {
    setInput({ ...input, category: value });
  };
  const selectCourseLevel = (value) => {
    setInput({ ...input, courseLevel: value });
  };
  const selectThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, courseThumbnail: file });
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewThumbnail(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const updateCourseHandler = async () => {
    const formData = new FormData();
    formData.append("courseTitle", input.courseTitle);
    formData.append("subTitle", input.subTitle);
    formData.append("description", descriptionContent);
    formData.append("category", input.category);
    formData.append("courseLevel", input.courseLevel);
    formData.append("coursePrice", input.coursePrice);
    formData.append("courseThumbnail", input.courseThumbnail);

    await editCourse({ courseId, formData });
  };

  const publishStatusHandler = async (action) => {
    try {
      const response = await publishCourse({ courseId, query: action });
      if (response.data.success) {
        refetch();
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error?.data?.error || "An error occurred!");
    }
  };

  const removeCourseHandler = async () => {
    try {
      const response = await removeCourse(courseId);
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/admin/course");
      }
    } catch (error) {
      toast.error(error?.data?.error || "Failed to delete course");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "Yay!! Course updated successfully!");
      refetch();
    }
    if (error) {
      toast.error(error?.data?.error || "An error occurred!");
    }
  }, [isSuccess, error]);

  if (courseByIdLoading) return <h1>Loading...</h1>;

  return (
    <Card className="shadow-md">
      {" "}
      <CardHeader className="flex flex-row justify-between items-center pb-4 border-b">
        {" "}
        <div>
          <CardTitle className="text-2xl font-semibold">
            {" "}
            Basic Course Information
          </CardTitle>
          <CardDescription className="text-gray-500">
            Make changes to your course details and settings. Click "Save" when
            you're done.
          </CardDescription>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            className="px-4 py-2"
            disabled={courseByIdData?.course.lectures.length === 0}
            onClick={() =>
              publishStatusHandler(
                courseByIdData?.course.isPublished ? "false" : "true"
              )
            }
          >
            {courseByIdData?.course.isPublished ? "Unpublished" : "Publish"}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="px-4 py-2"
                disabled={removeLoading}
              >
                {removeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                    wait...
                  </>
                ) : (
                  "Remove Course"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  course and all its lectures.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={removeCourseHandler}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {" "}
          <div className="space-y-6">
            <div>
              <Label className="text-base">Title</Label>
              <Input
                type="text"
                name="courseTitle"
                value={input.courseTitle}
                onChange={changeEventHandler}
                placeholder="Ex. Fullstack Developer"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-base">Subtitle</Label>
              <Input
                type="text"
                value={input.subTitle}
                onChange={changeEventHandler}
                name="subTitle"
                placeholder="Ex. Become a Fullstack Developer From Zero to Hero"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-base">Description</Label>
              <div className="mt-2 border rounded-md p-3">
                <RichTextEditor
                  input={{ description: descriptionContent }}
                  setInput={(newInput) =>
                    setDescriptionContent(newInput.description)
                  }
                />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-base">Category</Label>
                <Select onValueChange={selectCategory} value={input.category}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Category</SelectLabel>
                      {/* Updated Categories */}
                      <SelectItem value="Web Development">
                        Web Development
                      </SelectItem>
                      <SelectItem value="Mobile Development">
                        Mobile Development
                      </SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Machine Learning">
                        Machine Learning
                      </SelectItem>
                      <SelectItem value="Artificial Intelligence">
                        Artificial Intelligence
                      </SelectItem>
                      <SelectItem value="Cybersecurity">
                        Cybersecurity
                      </SelectItem>
                      <SelectItem value="Cloud Computing">
                        Cloud Computing
                      </SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Game Development">
                        Game Development
                      </SelectItem>
                      <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                      <SelectItem value="Digital Marketing">
                        Digital Marketing
                      </SelectItem>
                      <SelectItem value="Business Analytics">
                        Business Analytics
                      </SelectItem>
                      <SelectItem value="Project Management">
                        Project Management
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-base">Course Level</Label>
                <Select
                  onValueChange={selectCourseLevel}
                  value={input.courseLevel}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Course Level</SelectLabel>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-base">Price in (USD)</Label>
              <Input
                type="number"
                value={input.coursePrice}
                onChange={changeEventHandler}
                name="coursePrice"
                placeholder="Ex. 100"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-base">Course Thumbnail</Label>
              <div className="mt-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={selectThumbnail}
                  accept="image/*"
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer inline-flex items-center"
                >
                  <Image className="w-4 h-4 mr-2" /> Choose File
                </label>
                {previewThumbnail && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-gray-500">
                      Current file:{" "}
                      {typeof input.courseThumbnail === "string"
                        ? input.courseThumbnail.split("/").pop()
                        : input.courseThumbnail?.name}
                    </div>
                    <div className="relative aspect-video group">
                      <img
                        src={previewThumbnail}
                        alt="course-thumbnail"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <div
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-md"
                        onClick={() => {
                          setPreviewThumbnail("");
                          setInput({ ...input, courseThumbnail: "" });
                        }}
                      >
                        <XCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-2">
          {" "}
          <Button
            variant="outline"
            onClick={() => navigate("/admin/course")}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            onClick={updateCourseHandler}
            className="px-4 py-2"
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

export default CourseTab;
