import { createSelector } from "@reduxjs/toolkit";
import { selectError, selectLoading, selectPosts } from "./posts-slice";

export const selectPostsState = createSelector(
	[selectPosts, selectLoading, selectError],
	(posts, loading, error) => ({
		posts,
		loading,
		error,
		isEmpty: posts.length === 0,
		hasError: Boolean(error) && !loading,
		showList: !loading && !error && posts.length > 0,
	}),
);
