import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: 0,
  reducers: {
    increment: (state, action) => state + action.payload,
  },
});

// actions
export const { increment } = authSlice.actions;

// selector methods
export const selectedCount = (state) => state.auth;
// reducer
export default authSlice.reducer;
