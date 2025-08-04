import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
  loading: false,
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload); // add new post to top
    },
    setPostLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateSinglePost: (state, action) => {
      const updatedPost = action.payload;
      const index = state.posts.findIndex((post) => post._id === updatedPost._id);
      if (index !== -1) {
        state.posts[index] = updatedPost;
      }
    },
  },
});

export const { setPosts, addPost, setPostLoading ,updateSinglePost} = postSlice.actions;
export default postSlice.reducer;
