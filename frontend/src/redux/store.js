import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import mediaPreferenceReducer from "./mediaPreferenceSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    mediaPreference: mediaPreferenceReducer,
  },
});
