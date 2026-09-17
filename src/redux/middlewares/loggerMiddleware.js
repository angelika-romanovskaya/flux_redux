export const loggerMiddleware = (store) => (next) => (action) => {
	console.group(
		`%c action: ${action.type}`,
		"color: #2e7d32; font-weight: bold",
	);

	console.log("%c prev state", "color: #888", store.getState());

	const result = next(action);

	console.log("%c next state", "color: #1565c0", store.getState());

	console.groupEnd();

	return result;
};
