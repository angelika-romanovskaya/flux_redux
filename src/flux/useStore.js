import { useState, useEffect } from "react";
import { todoStore } from "./store";

export function useTodoStore() {
	const [state, setState] = useState(() => todoStore.getState());

	useEffect(() => {
		const unsubscribe = todoStore.subscribe(() => {
			setState(todoStore.getState());
		});
		return unsubscribe;
	}, []);
	return state;
}
