import { useState } from "react";
import { addTodo } from "../redux-toolkit/todo/todo-slice";
import { useDispatch } from "react-redux";

export default function TodoForm() {
	const [text, setText] = useState("");
	const dispatch = useDispatch();

	const handleSubmit = (e) => {
		e.preventDefault();
		dispatch(addTodo(text));
		setText("");
	};

	return (
		<form onSubmit={handleSubmit} className="todo-form">
			<input
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Новая задача..."
			/>
			<button type="submit">Добавить</button>
		</form>
	);
}
