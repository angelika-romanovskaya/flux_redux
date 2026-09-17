export const ActionTypes = {
	ADD_TODO: "ADD_TODO",
	TOGGLE_TODO: "TOGGLE_TODO",
	REMOVE_TODO: "REMOVE_TODO",
	RESET: "RESET",
};

export const addTodo = (text) => ({
	type: ActionTypes.ADD_TODO,
	payload: { text },
});

export const toggleTodo = (id) => ({
	type: ActionTypes.TOGGLE_TODO,
	payload: { id },
});

export const removeTodo = (id) => ({
	type: ActionTypes.REMOVE_TODO,
	payload: { id },
});

export const reset = () => ({
	type: ActionTypes.RESET,
});
