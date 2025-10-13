import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  data: {
    movieStats: {},
    tvStats: {},
    movieGenres: {},
    tvGenres: {},
    // you can add more keys here later (e.g., recommendations, watch history)
  },

  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserData: (state, action) => {
      // action.payload should be an object with keys to merge
      state.data = { ...state.data, ...action.payload };
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, setUserData, clearUser } = userSlice.actions;
export default userSlice.reducer;
