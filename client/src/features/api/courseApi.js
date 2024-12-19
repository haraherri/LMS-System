import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_API = "http://localhost:8084/api/v1/courses";
const SECTION_API = "http://localhost:8084/api/v1/sections";

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: [
    "Refetch_Creator_Course",
    "Refetch_Lecture",
    "Published_Courses",
    "Refetch_Section",
  ],
  baseQuery: fetchBaseQuery({ baseUrl: COURSE_API, credentials: "include" }),
  endpoints: (builder) => ({
    createCourse: builder.mutation({
      query: ({ courseTitle, category }) => ({
        url: "",
        method: "POST",
        body: { courseTitle, category },
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
    getSearchCourse: builder.query({
      query: ({ searchQuery, categories, sortByPrice }) => {
        let queryString = `/search?query=${encodeURIComponent(searchQuery)}`;

        if (categories && categories.length) {
          const categoriesString = categories.map(encodeURIComponent).join(",");
          queryString += `&categories=${categoriesString}`;
        }
        if (sortByPrice) {
          queryString += `&sortByPrice=${encodeURIComponent(sortByPrice)}`;
        }
        return {
          url: queryString,
          method: "GET",
        };
      },
    }),
    getPublishCourse: builder.query({
      query: () => ({
        url: "/published-courses",
        method: "GET",
      }),
      providesTags: ["Published_Courses"],
    }),
    getCreatorCourse: builder.query({
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: ["Refetch_Creator_Course"],
    }),
    editCourse: builder.mutation({
      query: ({ formData, courseId }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Refetch_Creator_Course", "Published_Courses"],
    }),
    getCourseById: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
    }),
    createLecture: builder.mutation({
      query: ({ lectureTitle, sectionId, courseId }) => ({
        // Thêm courseId
        url: `/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle, sectionId },
      }),
      invalidatesTags: ["Refetch_Lecture", "Refetch_Section"],
    }),
    getCourseLecture: builder.query({
      query: (courseId) => ({
        url: `/lecture/course/${courseId}`,
        method: "GET",
      }),
      providesTags: ["Refetch_Lecture"],
    }),
    editLecture: builder.mutation({
      query: ({
        lectureTitle,
        videoInfo,
        isPreviewFree,
        courseId,
        lectureId,
      }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "PATCH",
        body: { lectureTitle, videoInfo, isPreviewFree },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        "Refetch_Lecture",
        { type: "Progress", id: courseId },
      ],
    }),
    removeLecture: builder.mutation({
      query: ({ lectureId, courseId }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Lecture", "Refetch_Section"],
    }),
    getLectureById: builder.query({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "GET",
      }),
    }),
    publishCourse: builder.mutation({
      query: ({ courseId, query }) => ({
        url: `/${courseId}?publish=${query}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Refetch_Creator_Course", "Published_Courses"],
    }),
    removeCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
    createSection: builder.mutation({
      query: ({ sectionTitle, courseId }) => ({
        url: `${SECTION_API}/${courseId}`,
        method: "POST",
        body: { sectionTitle },
      }),
      invalidatesTags: ["Refetch_Section"],
    }),
    getCourseSections: builder.query({
      query: (courseId) => ({
        url: `${SECTION_API}/course/${courseId}`,
        method: "GET",
      }),
      providesTags: ["Refetch_Section"], //
    }),
    updateSection: builder.mutation({
      query: ({ sectionId, sectionTitle }) => ({
        url: `${SECTION_API}/${sectionId}`,
        method: "PUT",
        body: { sectionTitle },
      }),
      invalidatesTags: ["Refetch_Section", "Refetch_Lecture"],
    }),
    deleteSection: builder.mutation({
      query: ({ sectionId }) => ({
        url: `${SECTION_API}/${sectionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Section", "Refetch_Lecture"],
    }),
  }),
});

export const {
  useCreateCourseMutation,
  useGetSearchCourseQuery,
  useGetPublishCourseQuery,
  useGetCreatorCourseQuery,
  useEditCourseMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  usePublishCourseMutation,
  useRemoveCourseMutation,
  useCreateSectionMutation,
  useGetCourseSectionsQuery,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} = courseApi;
