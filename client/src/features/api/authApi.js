const USER_API = "http://localhost:8084/api/v1/users/";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";
import { courseApi } from "./courseApi";
import { purchaseApi } from "./purchaseApi";
import { toast } from "sonner";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: USER_API, credentials: "include" }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
    }),
    loginUser: builder.mutation({
      query: (data) => ({
        url: "login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          // Dispatch userLoggedIn after other API calls are initiated
          await Promise.all([
            dispatch(purchaseApi.endpoints.getPurchasedCourses.initiate()),
            dispatch(courseApi.endpoints.getCreatorCourse.initiate()),
            dispatch(courseApi.endpoints.getPublishCourse.initiate()),
          ]);

          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.error(error);
          // toast.error(
          //   error.data?.error ||
          //     error.message ||
          //     "Login failed! Please try again later."
          // );
        }
      },
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;

          // Dispatch userLoggedOut action to reset auth state
          dispatch(userLoggedOut());

          // Reset all API states to clear user's cache
          dispatch(courseApi.util.resetApiState());
          dispatch(purchaseApi.util.resetApiState());
        } catch (error) {
          console.log(error);
        }
      },
    }),
    loadUser: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    updateUser: builder.mutation({
      query: (formData) => ({
        url: "profile/update",
        method: "PUT",
        body: formData,
        credentials: "include",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const { data: updatedUser } = await queryFulfilled;
          dispatch(userLoggedIn({ user: updatedUser.user }));
          dispatch(courseApi.util.invalidateTags(["Published_Courses"]));
        } catch (error) {
          console.log(error);
        }
      },
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLoadUserQuery,
  useLogoutUserMutation,
  useUpdateUserMutation,
} = authApi;
