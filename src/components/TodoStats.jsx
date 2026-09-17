import { reset } from "../flux/actions";
import { useDispatch } from "react-redux";

export default function TodoStats({ todos }) {
	const total = todos.length;
	const done = todos.filter((t) => t.done).length;
	const active = todos.filter((t) => !t.done).length;
	const dispatch = useDispatch();

	return (
		<div className="stats">
			<span>
				Всего: <b>{total}</b> · Активные: <b>{active}</b> · Выполнено:{" "}
				<b>{done}</b>
			</span>
			<button onClick={() => dispatch(reset())}>Сбросить всё</button>
		</div>
	);
}
