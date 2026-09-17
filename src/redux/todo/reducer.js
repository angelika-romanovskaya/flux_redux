import { v4 } from "uuid";
import { ActionTypes } from "./actions";

const initialState = {
	todos: [
		{ id: 1, text: "Изучить Flux", done: false },
		{ id: 2, text: "Сделать ДЗ 22", done: false },
	],
};

export const todoReducer = (store = initialState, action) => {
	switch (action.type) {
		case ActionTypes.ADD_TODO: {
			const text = action.payload.text.trim();
			if (!text) return store;
			return {
				...store,
				todos: [...store.todos, { id: v4(), text, done: false }],
			};
		}
		case ActionTypes.TOGGLE_TODO:
			return {
				...store,
				todos: store.todos.map((t) =>
					t.id === action.payload.id ? { ...t, done: !t.done } : t,
				),
			};

		case ActionTypes.REMOVE_TODO:
			return {
				...store,
				todos: store.todos.filter((t) => t.id !== action.payload.id),
			};

		case ActionTypes.RESET: {
			return { todos: [] };
		}

		default:
			return store;
	}
};
