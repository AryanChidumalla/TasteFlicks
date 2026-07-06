import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  movies: [],
  tv: [],
};

const mediaPreferenceSlice = createSlice({
  name: "mediaPreference",
  initialState,
  reducers: {
    setMovies: (state, action) => {
      state.movies = action.payload;
    },
    addMovie: (state, action) => {
      state.movies.push(action.payload);
    },
    setTv: (state, action) => {
      state.tv = action.payload;
    },
    addTvShow: (state, action) => {
      state.tv.push(action.payload);
    },
    clearMedia: () => initialState,
  },
});

export const { setMovies, addMovie, setTv, addTvShow, clearMedia } =
  mediaPreferenceSlice.actions;

export default mediaPreferenceSlice.reducer;
