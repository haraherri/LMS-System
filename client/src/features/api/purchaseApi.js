import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PURCHASE_API = "http://localhost:8084/api/v1/purchase";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  tagTypes: ["CourseStatus"],
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: ({ courseId }) => ({
        url: "/checkout/create-checkout-session",
        method: "POST",
        body: { courseId },
      }),
    }),
    getCourseDetailWithStatus: builder.query({
      query: ({ courseId }) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
      providesTags: ["CourseStatus"],
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
    }),
    getRevenueAnalytics: builder.query({
      query: () => ({
        url: "/analytics/revenue",
        method: "GET",
      }),
    }),
    getPublicCourseDetail: builder.query({
      query: ({ courseId }) => ({
        url: `/course/${courseId}/public-detail`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetCourseDetailWithStatusQuery,
  useGetPurchasedCoursesQuery,
  useGetRevenueAnalyticsQuery,
  useGetPublicCourseDetailQuery,
} = purchaseApi;
