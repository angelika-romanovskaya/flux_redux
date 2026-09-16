import { useState } from "react";
import { dispatcher } from "../flux/dispatcher";
import { addTodo } from "../flux/actions";

export default function TodoForm() {
	const [text, setText] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		dispatcher.dispatch(addTodo(text));
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
