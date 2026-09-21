import { createSlice } from "@reduxjs/toolkit";
import { v4 } from "uuid";

const initialState = [
	{ id: "1", text: "Изучить Flux", done: false },
	{ id: "2", text: "Переписать на RTK", done: false },
];

const todosSlice = createSlice({
	name: "todos",
	initialState,
	reducers: {
		addTodo: {
			reducer(state, action) {
				state.push(action.payload);
			},
			prepare(text) {
				return {
					payload: { id: v4(), text: text.trim(), done: false },
				};
			},
		},
		removeTodo(state, action) {
			return state.filter((t) => t.id !== action.payload);
		},
		toggleTodo(state, action) {
			const todo = state.find((t) => t.id === action.payload);
			if (todo) todo.done = !todo.done;
		},
		clearCompleted(state) {
			return state.filter((t) => !t.done);
		},
	},
});

export const { addTodo, removeTodo, toggleTodo, clearCompleted } =
	todosSlice.actions;
export default todosSlice.reducer;
