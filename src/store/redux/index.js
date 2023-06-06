import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "~/features/Auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: AuthReducer,
  },
});
