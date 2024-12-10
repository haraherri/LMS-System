const USER_API = "http://localhost:8084/api/v1/users/";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";
import { courseApi } from "./courseApi";
import { purchaseApi } from "./purchaseApi";

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
          // Reset all API states first to clear old user's cache
          dispatch(courseApi.util.resetApiState());
          dispatch(purchaseApi.util.resetApiState());

          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));

          // Then initialize new states for new user
          await dispatch(courseApi.util.initiate());
          await dispatch(purchaseApi.util.initiate());
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
          await queryFulfilled;

          // Reset auth state first
          dispatch(userLoggedOut());

          // Then reset all API states
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
