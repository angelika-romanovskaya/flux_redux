export function createDispatcher() {
	const callbacks = new Set();

	const register = (callback) => {
		callbacks.add(callback);
		return () => callbacks.delete(callback);
	};

	const dispatch = (action) => {
		if (!action || typeof action.type !== "string") {
			throw new Error("Action должен быть объектом с полем type");
		}
		callbacks.forEach((cb) => cb(action));
	};

	return { register, dispatch };
}

export const dispatcher = createDispatcher();
