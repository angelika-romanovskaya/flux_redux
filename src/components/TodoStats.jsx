import { dispatcher } from "../flux/dispatcher";
import { reset } from "../flux/actions";

export default function TodoStats({ todos }) {
	const total = todos.length;
	const done = todos.filter((t) => t.done).length;

	return (
		<div className="stats">
			<span>
				Всего: <b>{total}</b> · Выполнено: <b>{done}</b>
			</span>
			<button onClick={() => dispatcher.dispatch(reset())}>Сбросить всё</button>
		</div>
	);
}
