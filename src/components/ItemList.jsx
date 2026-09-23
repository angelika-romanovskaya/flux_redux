import { useGetItemsQuery, useDeleteItemMutation } from "../rtk-query/apiSlice";

export function ItemList({ onEdit }) {
	const { data: items, isLoading, isError, error } = useGetItemsQuery();
	const [deleteItem] = useDeleteItemMutation();

	if (isLoading) return <div>Загрузка...</div>;
	if (isError) return <div>Ошибка: {error.message}</div>;

	return (
		<ul style={{ listStyle: "none", padding: 0 }}>
			{items.map((item) => (
				<li
					key={item.id}
					style={{ marginBottom: 8, display: "flex", alignItems: "center" }}
				>
					<span style={{ flex: 1 }}>{item.title}</span>
					<button onClick={() => onEdit(item)} style={{ marginRight: 4 }}>
						Редактировать
					</button>
					<button onClick={() => deleteItem(item.id)}>Удалить</button>
				</li>
			))}
		</ul>
	);
}
