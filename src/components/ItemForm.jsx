import { useState, useEffect } from "react";
import {
	useCreateItemMutation,
	useUpdateItemMutation,
} from "../rtk-query/apiSlice";

export function ItemForm({ editingItem, onFinish }) {
	const [title, setTitle] = useState("");
	const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
	const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();

	useEffect(() => {
		if (editingItem) {
			setTitle(editingItem.title);
		} else {
			setTitle("");
		}
	}, [editingItem]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (editingItem) {
			await updateItem({ id: editingItem.id, title });
		} else {
			await createItem({ title });
		}
		setTitle("");
		onFinish();
	};

	const isLoading = isCreating || isUpdating;

	return (
		<form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
			<input
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				placeholder="Введите заголовок"
				required
			/>
			<button type="submit" disabled={isLoading}>
				{editingItem ? "Обновить" : "Создать"}
			</button>
			{editingItem && (
				<button type="button" onClick={onFinish} style={{ marginLeft: 8 }}>
					Отмена
				</button>
			)}
		</form>
	);
}
