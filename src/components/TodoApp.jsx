import { useSelector } from "react-redux";
import TodoForm from "./TodoForm";
import TodoList from "./TodoList";
import TodoStats from "./TodoStats";

export default function TodoApp() {
	const { todos } = useSelector((state) => state.todo);

	return (
		<div className="app-section">
			<h2>Задачи</h2>
			<TodoForm />
			<TodoStats todos={todos} />
			<TodoList todos={todos} />
			<pre className="state-view">{JSON.stringify(todos, null, 2)}</pre>
		</div>
	);
}
