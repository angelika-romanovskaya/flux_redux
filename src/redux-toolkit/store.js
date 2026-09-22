import { configureStore } from "@reduxjs/toolkit";
import todosReducer from "../redux-toolkit/todo/todo-slice";
import filterReducer from "../redux-toolkit/todo/filter-slice";
import postsReducer from "../redux-toolkit/posts/posts-slice";

export const store = configureStore({
	reducer: {
		todos: todosReducer,
		filter: filterReducer,
		posts: postsReducer,
	},
});
