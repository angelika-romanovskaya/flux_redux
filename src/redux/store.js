import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { todoReducer } from "./todo/reducer";
import { postsReducer } from "./posts/reducer";
import { thunk } from "redux-thunk";
import { loggerMiddleware } from "./middlewares/loggerMiddleware";

const rootReducer = combineReducers({
	todo: todoReducer,
	posts: postsReducer,
});

export const store = legacy_createStore(
	rootReducer,
	applyMiddleware(thunk, loggerMiddleware),
);
