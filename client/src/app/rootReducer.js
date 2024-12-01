import { authApi } from "@/features/api/authApi";
import { combineReducers } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
});

export default rootReducer;
