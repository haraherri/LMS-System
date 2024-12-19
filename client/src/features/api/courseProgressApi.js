import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PROGRESS_API = "http://localhost:8084/api/v1/progress";

export const courseProgressApi = createApi({
  reducerPath: "courseProgressApi",
  tagTypes: ["Progress"],
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PROGRESS_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getCourseProgress: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "Progress", id: courseId },
      ],
    }),
    updateLectureProgress: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: `/${courseId}/lecture/${lectureId}/view`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Progress", id: courseId },
      ],
    }),
    markAsCompleted: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}/complete`,
        method: "PATCH", // Changed from POST to PATCH
      }),
      invalidatesTags: (result, error, courseId) => [
        { type: "Progress", id: courseId },
      ],
    }),
    markAsInCompleted: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}/incomplete`,
        method: "PATCH", // Changed from POST to PATCH
      }),
      invalidatesTags: (result, error, courseId) => [
        { type: "Progress", id: courseId },
      ],
    }),
  }),
});

export const {
  useGetCourseProgressQuery,
  useUpdateLectureProgressMutation,
  useMarkAsCompletedMutation,
  useMarkAsInCompletedMutation,
} = courseProgressApi;
