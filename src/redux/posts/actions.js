export const ActionTypes = {
	FETCH_POSTS_REQUEST: "FETCH_POSTS_REQUEST",
	FETCH_POSTS_SUCCESS: "FETCH_POSTS_SUCCESS",
	FETCH_POSTS_FAILURE: "FETCH_POSTS_FAILURE",
	CLEAR_POSTS: "CLEAR_POSTS",
};

export const fetchPostsRequest = () => ({
	type: ActionTypes.FETCH_POSTS_REQUEST,
});

export const fetchPostsSuccess = (posts) => ({
	type: ActionTypes.FETCH_POSTS_SUCCESS,
	payload: { posts },
});

export const fetchPostsFailure = (error) => ({
	type: ActionTypes.FETCH_POSTS_FAILURE,
	payload: { error },
});

export const clearPosts = () => ({
	type: ActionTypes.CLEAR_POSTS,
});

export const fetchPosts = () => async (dispatch) => {
	dispatch(fetchPostsRequest());

	try {
		const response = await fetch(
			"https://jsonplaceholder.typicode.com/posts?_limit=10",
		);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const posts = await response.json();
		dispatch(fetchPostsSuccess(posts));
	} catch (error) {
		dispatch(fetchPostsFailure(error.message || "Не удалось загрузить данные"));
	}
};
