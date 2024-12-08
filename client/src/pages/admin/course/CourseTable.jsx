import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Edit, Loader2, Plus } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const CourseTable = () => {
  const { data, error, isLoading } = useGetCreatorCourseQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <p className="text-destructive text-lg font-medium">
          Failed to load courses
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="gap-2"
        >
          <Loader2 className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Course Management
            </h2>
            <p className="text-muted-foreground text-sm">
              You have {data.courses.length} course
              {data.courses.length !== 1 && "s"} in total
            </p>
          </div>
          <Button onClick={() => navigate(`create`)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-[40%] py-3">Course Name</TableHead>
              <TableHead className="w-[20%] py-3">Category</TableHead>
              <TableHead className="w-[10%] py-3">Status</TableHead>
              <TableHead className="w-[15%] text-right py-3">Price</TableHead>
              <TableHead className="w-[15%] text-center py-3">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.courses.map((course) => (
              <TableRow key={course._id} className="hover:bg-muted/50">
                <TableCell className="py-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium line-clamp-1">
                      {course.courseTitle}
                    </span>
                    {course.subTitle && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {course.subTitle}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {course.category}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    variant={course.isPublished ? "success" : "secondary"}
                    className={`text-xs px-2 py-0.5 ${
                      course.isPublished
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-3">
                  {course?.coursePrice ? (
                    <span className="font-medium">
                      ${course.coursePrice.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Not set
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`${course._id}`)}
                      className="h-8 w-8 p-0 hover:bg-muted rounded-full"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit course</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CourseTable;
