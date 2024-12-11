import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateLectureMutation,
  useCreateSectionMutation,
  useGetCourseSectionsQuery,
  useDeleteSectionMutation,
  useUpdateSectionMutation,
} from "@/features/api/courseApi";

import { Loader2, Pencil, PlusCircle, Trash, FileVideo } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
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

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionTitle, setEditSectionTitle] = useState("");
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();

  // Thêm state để theo dõi trạng thái mở của các AccordionItem
  const [openSections, setOpenSections] = useState({});

  const [createLecture, { isLoading, isSuccess, error }] =
    useCreateLectureMutation();
  const [
    createSection,
    {
      isLoading: isCreatingSection,
      isSuccess: isSectionSuccess,
      error: sectionError,
    },
  ] = useCreateSectionMutation();

  const {
    data: sectionsData,
    isLoading: sectionsIsLoading,
    isError: sectionsIsError,
    refetch: refetchSections,
  } = useGetCourseSectionsQuery(courseId);

  const [
    deleteSection,
    { isSuccess: isDeleteSuccess, isError: isDeleteError },
  ] = useDeleteSectionMutation();
  const [
    updateSection,
    { isSuccess: isUpdateSuccess, isError: isUpdateError },
  ] = useUpdateSectionMutation();

  const createLectureHandler = async () => {
    if (!selectedSectionId) {
      toast.error("Please select a section");
      return;
    }
    await createLecture({ lectureTitle, sectionId: selectedSectionId });
  };

  const createSectionHandler = async () => {
    if (!sectionTitle.trim()) {
      toast.error("Section title is required");
      return;
    }
    await createSection({ sectionTitle, courseId });
  };

  const handleEditSection = (sectionId, title) => {
    setEditingSectionId(sectionId);
    setEditSectionTitle(title);
    setSelectedSectionId(sectionId);
  };

  const handleUpdateSection = async () => {
    if (!editSectionTitle.trim()) {
      toast.error("Section title is required");
      return;
    }
    await updateSection({
      sectionId: editingSectionId,
      sectionTitle: editSectionTitle,
    });
    setEditingSectionId(null);
    setEditSectionTitle("");
  };

  const handleDeleteSection = async (sectionId) => {
    await deleteSection({ sectionId }).unwrap();
  };

  useEffect(() => {
    if (isSuccess) {
      setLectureTitle("");
      refetchSections();
      toast.success("Congrats! Lecture created successfully");
    }
    if (error) {
      toast.error(error?.data?.message || "Failed to create lecture");
    }
    if (isSectionSuccess) {
      setSectionTitle("");
      refetchSections();
      toast.success("Congrats! Section created successfully");
    }
    if (sectionError) {
      toast.error(sectionError?.data?.message || "Failed to create section");
    }
    if (isDeleteSuccess) {
      refetchSections();
      toast.success("Section deleted successfully");
    }

    if (isDeleteError) {
      toast.error("Failed to delete section");
    }

    if (isUpdateSuccess) {
      refetchSections();
      toast.success("Section updated successfully");
    }

    if (isUpdateError) {
      toast.error("Failed to update section");
    }
  }, [
    isSuccess,
    error,
    isSectionSuccess,
    sectionError,
    refetchSections,
    isDeleteSuccess,
    isDeleteError,
    isUpdateSuccess,
    isUpdateError,
  ]);

  // Hàm xử lý khi một AccordionItem được mở hoặc đóng
  const handleSectionToggle = (sectionId, isOpen) => {
    setOpenSections((prevOpenSections) => ({
      ...prevOpenSections,
      [sectionId]: isOpen,
    }));

    // Nếu section được đóng, kiểm tra xem nó có phải là selectedSectionId không
    if (!isOpen && selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FileVideo className="mr-2" size={40} />
            Manage Lectures
          </h1>
          <p className="text-gray-600">
            Add, edit, or delete lectures for your course.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/admin/course/${courseId}`)}
          className="hover:bg-blue-100"
        >
          <span className="text-blue-500 font-semibold">Back to Course</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Section Creation */}
        <div className="bg-gray-50 border rounded-lg p-4 shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-4">
            <PlusCircle className="mr-2" size={24} />
            Create a New Section
          </h2>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="section-title" className="text-gray-700">
                Section Title
              </Label>
              <Input
                id="section-title"
                type="text"
                placeholder="Enter section title"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={createSectionHandler}
              disabled={isCreatingSection}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              {isCreatingSection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Section"
              )}
            </Button>
          </div>
        </div>

        {/* Accordion for Sections and Lectures */}
        <div className="border rounded-lg shadow-md">
          <Accordion
            type="multiple"
            collapsible
            className="w-full"
            value={Object.keys(openSections).filter(
              (sectionId) => openSections[sectionId]
            )}
            onValueChange={(value) => {
              const updatedOpenSections = {};
              value.forEach((sectionId) => {
                updatedOpenSections[sectionId] = true;
              });
              setOpenSections(updatedOpenSections);
              setSelectedSectionId(value[0] || null);
            }}
          >
            {sectionsIsLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-gray-600">Loading sections...</p>
              </div>
            ) : sectionsIsError ? (
              <div className="p-4 text-center text-red-500">
                Failed to load sections
              </div>
            ) : (
              sectionsData?.sections.map((section) => (
                <AccordionItem value={section._id} key={section._id}>
                  <AccordionTrigger
                    className="hover:no-underline p-4 text-gray-700"
                    onClick={() => {
                      // Cập nhật trạng thái mở/đóng của section
                      handleSectionToggle(
                        section._id,
                        !openSections[section._id]
                      );

                      // Nếu đang edit section này và click lại vào chính nó, thì đóng lại
                      if (editingSectionId === section._id) {
                        setEditingSectionId(null);
                        setEditSectionTitle("");
                        setSelectedSectionId(null);
                      } else {
                        // Nếu đang không edit section nào hoặc click vào section khác thì mở section đó ra
                        setEditingSectionId(null);
                        setEditSectionTitle("");
                      }
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-lg">
                        {section.sectionTitle}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Edit Section */}
                        {editingSectionId === section._id ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleUpdateSection}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingSectionId(null);
                                setEditSectionTitle("");
                                // Không cần setSelectedSectionId(null) ở đây
                              }}
                              className="bg-gray-500 hover:bg-gray-600 text-white"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSection(
                                section._id,
                                section.sectionTitle
                              );
                            }}
                            className="hover:bg-yellow-100"
                          >
                            <Pencil className="h-4 w-4 text-yellow-500" />
                          </Button>
                        )}
                        {/* Delete Section with AlertDialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="hover:bg-red-100"
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you sure absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the section{" "}
                                <span className="font-bold">
                                  {section.sectionTitle}
                                </span>{" "}
                                and all lectures within it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSection(section._id);
                                }}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </AccordionTrigger>
                  {/* Edit Section Input */}
                  {editingSectionId === section._id && (
                    <div className="p-4">
                      <Input
                        type="text"
                        value={editSectionTitle}
                        onChange={(e) => setEditSectionTitle(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  )}
                  <AccordionContent className="p-4 space-y-4 bg-gray-50">
                    {/* Lectures within the section */}
                    {section.lectures.map((lecture) => (
                      <div
                        key={lecture._id}
                        className="border-b pb-2 last:border-b-0 flex items-center justify-between"
                      >
                        <p className="text-gray-700">{lecture.lectureTitle}</p>
                        {/* Edit Lecture Button */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            navigate(
                              `/admin/course/${courseId}/lecture/${lecture._id}`
                            )
                          }
                          className="hover:bg-blue-100"
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                      </div>
                    ))}

                    {/* Input and button for new lecture */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <Label
                          htmlFor={`lecture-title-${section._id}`}
                          className="text-gray-700"
                        >
                          Lecture Title
                        </Label>
                        <Input
                          id={`lecture-title-${section._id}`}
                          type="text"
                          placeholder="Lecture Name"
                          disabled={selectedSectionId !== section._id}
                          value={
                            selectedSectionId === section._id
                              ? lectureTitle
                              : ""
                          }
                          onChange={(e) => {
                            if (selectedSectionId === section._id) {
                              setLectureTitle(e.target.value);
                            }
                          }}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={createLectureHandler}
                        disabled={
                          isLoading || selectedSectionId !== section._id
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Please wait...
                          </>
                        ) : (
                          "Create Lecture"
                        )}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;
