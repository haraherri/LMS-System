import { combineReducers } from "@reduxjs/toolkit";
import { authApi } from "@/features/api/authApi";
import authReducer, { userLoggedOut } from "@/features/authSlice";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";

const appReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [courseApi.reducerPath]: courseApi.reducer,
  [purchaseApi.reducerPath]: purchaseApi.reducer,
  [courseProgressApi.reducerPath]: courseProgressApi.reducer,
  auth: authReducer,
});

const rootReducer = (state, action) => {
  if (action.type === userLoggedOut.type) {
    // Reset all states to initial state when user logs out
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export default rootReducer;
