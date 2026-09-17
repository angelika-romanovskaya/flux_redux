import { useTodoStore } from "./flux/useStore";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import TodoStats from "./components/TodoStats";
import { useSelector } from "react-redux";

export default function App() {
	const { todos } = useSelector((store) => store);

	return (
		<div className="app">
			<h1>Redux Todo</h1>
			<TodoForm />
			<TodoStats todos={todos} />
			<TodoList todos={todos} />

			<pre className="state-view">{JSON.stringify(todos, null, 2)}</pre>
		</div>
	);
}
