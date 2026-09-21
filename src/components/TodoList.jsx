import { useDispatch, useSelector } from "react-redux";
import { setFilter } from "../redux-toolkit/todo/filter-slice";
import { toggleTodo, removeTodo } from "../redux-toolkit/todo/todo-slice";

const FILTERS = {
	ALL: "all",
	ACTIVE: "active",
	DONE: "done",
};

export default function TodoList({ todos }) {
	const dispatch = useDispatch();
	const { filter } = useSelector((state) => state);

	const visibleTodos = todos.filter((todo) => {
		if (filter === FILTERS.ACTIVE) return !todo.done;
		if (filter === FILTERS.DONE) return todo.done;
		return true;
	});

	return (
		<div>
			<div className="filters">
				<button
					className={filter === FILTERS.ALL ? "active" : ""}
					onClick={() => dispatch(setFilter(FILTERS.ALL))}
				>
					Все
				</button>
				<button
					className={filter === FILTERS.ACTIVE ? "active" : ""}
					onClick={() => dispatch(setFilter(FILTERS.ACTIVE))}
				>
					Активные
				</button>
				<button
					className={filter === FILTERS.DONE ? "active" : ""}
					onClick={() => dispatch(setFilter(FILTERS.DONE))}
				>
					Выполненные
				</button>
			</div>

			{visibleTodos.length === 0 ? (
				<p className="empty">
					{filter === FILTERS.ALL
						? "Список пуст"
						: filter === FILTERS.ACTIVE
							? "Нет активных задач"
							: "Нет выполненных задач"}
				</p>
			) : (
				<ul className="todo-list">
					{visibleTodos.map((todo) => (
						<li key={todo.id} className={todo.done ? "done" : ""}>
							<label>
								<input
									type="checkbox"
									checked={todo.done}
									onChange={() => dispatch(toggleTodo(todo.id))}
								/>
								<span>{todo.text}</span>
							</label>
							<button
								className="remove"
								onClick={() => dispatch(removeTodo(todo.id))}
							>
								✕
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
