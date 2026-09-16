import { dispatcher } from "./dispatcher";
import { ActionTypes } from "./actions";

const initialState = {
	todos: [
		{ id: 1, text: "Изучить Flux", done: false },
		{ id: 2, text: "Сделать ДЗ 22", done: false },
	],
};

function reduce(state, action, ctx) {
	switch (action.type) {
		case ActionTypes.ADD_TODO: {
			const text = action.payload.text.trim();
			if (!text) return null;
			return {
				...state,
				todos: [...state.todos, { id: ctx.nextId(), text, done: false }],
			};
		}

		case ActionTypes.TOGGLE_TODO:
			return {
				...state,
				todos: state.todos.map((t) =>
					t.id === action.payload.id ? { ...t, done: !t.done } : t,
				),
			};

		case ActionTypes.REMOVE_TODO:
			return {
				...state,
				todos: state.todos.filter((t) => t.id !== action.payload.id),
			};

		case ActionTypes.RESET:
			ctx.resetNextId();
			return { todos: [] };

		default:
			return null;
	}
}

export function createStore() {
	let state = initialState;
	let idCounter = 3;
	const listeners = new Set();

	const ctx = {
		nextId: () => idCounter++,
		resetNextId: () => {
			idCounter = 1;
		},
	};

	const getState = () => state;

	const subscribe = (listener) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	};

	const emitChange = () => listeners.forEach((fn) => fn());

	const handleAction = (action) => {
		const next = reduce(state, action, ctx);
		if (next === null) return;
		state = next;
		emitChange();
	};

	dispatcher.register(handleAction);

	return { getState, subscribe };
}

export const todoStore = createStore();
