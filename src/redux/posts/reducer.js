import { ActionTypes } from "./actions";

const initialState = {
	posts: [],
	loading: false,
	error: null,
};

export const postsReducer = (state = initialState, action) => {
	switch (action.type) {
		case ActionTypes.FETCH_POSTS_REQUEST:
			return { ...state, loading: true, error: null };

		case ActionTypes.FETCH_POSTS_SUCCESS:
			return {
				...state,
				loading: false,
				error: null,
				posts: action.payload.posts,
			};

		case ActionTypes.FETCH_POSTS_FAILURE:
			return {
				...state,
				loading: false,
				error: action.payload.error,
			};

		case ActionTypes.CLEAR_POSTS:
			return { ...state, posts: [] };

		default:
			return state;
	}
};
