import { dispatcher } from "../flux/dispatcher";
import { toggleTodo, removeTodo } from "../flux/actions";

export default function TodoList({ todos }) {
	if (!todos.length) return <p className="empty">Список пуст</p>;

	return (
		<ul className="todo-list">
			{todos.map((todo) => (
				<li key={todo.id} className={todo.done ? "done" : ""}>
					<label>
						<input
							type="checkbox"
							checked={todo.done}
							onChange={() => dispatcher.dispatch(toggleTodo(todo.id))}
						/>
						<span>{todo.text}</span>
					</label>
					<button
						className="remove"
						onClick={() => dispatcher.dispatch(removeTodo(todo.id))}
					>
						✕
					</button>
				</li>
			))}
		</ul>
	);
}
