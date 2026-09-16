import { useTodoStore } from "./flux/useStore";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import TodoStats from "./components/TodoStats";

export default function App() {
	const state = useTodoStore();

	return (
		<div className="app">
			<h1>Flux Todo</h1>
			<TodoForm />
			<TodoList todos={state.todos} />
			<TodoStats todos={state.todos} />

			<pre className="state-view">{JSON.stringify(state, null, 2)}</pre>
		</div>
	);
}
