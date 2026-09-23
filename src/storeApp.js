import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./rtk-query/apiSlice";
import todosReducer from "./redux-toolkit/todo/todo-slice";
import filterReducer from "./redux-toolkit/todo/filter-slice";
import postsReducer from "./redux-toolkit/posts/posts-slice";

export const storeApp = configureStore({
	reducer: {
		todos: todosReducer,
		filter: filterReducer,
		posts: postsReducer,
		[apiSlice.reducerPath]: apiSlice.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware),
});
