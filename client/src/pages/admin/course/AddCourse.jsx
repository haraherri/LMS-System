import { Button } from "@/components/ui/button";
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
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AddCourse = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");

  const [createCourse, { data, isLoading, error, isSuccess }] =
    useCreateCourseMutation();

  const navigate = useNavigate();

  const getSelectedCategory = (value) => {
    setCategory(value);
  };

  const createCourseHandler = async () => {
    await createCourse({ courseTitle, category });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course created successfully");
      navigate("/admin/course");
    }
  }, [isSuccess, error]);

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">Add a New Course</h1>
        <p className="text-sm">
          {" "}
          Start by providing the essential details to create your new course.
          Make it engaging and informative for your students!
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            placeholder="Course Name"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select onValueChange={getSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="Web Development">Web Development</SelectItem>
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
                <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/course")}>
            Back
          </Button>
          <Button disabled={isLoading} onClick={createCourseHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
