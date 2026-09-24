import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
	posts: [],
	loading: false,
	error: null,
};

export const fetchPosts = createAsyncThunk(
	"posts/fetchPosts",
	async (_, thunkApi) => {
		try {
			const response = await fetch(
				"https://jsonplaceholder.typicode.com/posts?_limit=10",
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			return thunkApi.rejectWithValue(
				error.message || "Не удалось загрузить данные",
			);
		}
	},
);

const postsSlice = createSlice({
	name: "posts",
	initialState,
	reducers: {
		clearPosts(state) {
			state.posts = [];
			state.error = null;
		},
	},
	selectors: {
		selectPosts: (state) => state.posts,
		selectLoading: (state) => state.loading,
		selectError: (state) => state.error,
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchPosts.fulfilled, (state, action) => {
				console.log(state, action);
				state.loading = false;
				state.error = null;
				state.posts = action.payload;
			})
			.addMatcher(
				(action) =>
					action.type.startsWith("posts/") && action.type.endsWith("/pending"),
				(state) => {
					state.loading = true;
					state.error = null;
				},
			)
			.addMatcher(
				(action) =>
					action.type.startsWith("posts/") && action.type.endsWith("/rejected"),
				(state, action) => {
					state.loading = false;
					state.error = action.payload;
				},
			);
	},
});

export const { clearPosts } = postsSlice.actions;
export const { selectPosts, selectLoading, selectError, selectPostsCount } =
	postsSlice.selectors;
export default postsSlice.reducer;
