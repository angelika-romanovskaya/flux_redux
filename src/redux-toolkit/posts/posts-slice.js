import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	posts: [],
	loading: false,
	error: null,
};

const postsSlice = createSlice({
	name: "posts",
	initialState,
	reducers: {
		clearPosts(state) {
			state.posts = [];
		},
	},
});

export const { clearPosts } = postsSlice.actions;
export default postsSlice.reducer;

export const selectPosts = (state) => state.posts.posts;
export const selectLoading = (state) => state.posts.loading;
export const selectError = (state) => state.posts.error;
