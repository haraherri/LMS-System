const USER_API = "http://localhost:8084/api/v1/users/";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";
import { courseApi } from "./courseApi";

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
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
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
    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          dispatch(userLoggedOut());
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
