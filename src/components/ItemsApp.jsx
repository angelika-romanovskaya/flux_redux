import { useState } from "react";
import { ItemForm } from "./ItemForm";
import { ItemList } from "./ItemList";

export default function ItemsApp() {
	const [editingItem, setEditingItem] = useState(null);

	return (
		<div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
			<h1>CRUD на RTK Query</h1>
			<ItemForm
				editingItem={editingItem}
				onFinish={() => setEditingItem(null)}
			/>
			<ItemList onEdit={setEditingItem} />
		</div>
	);
}
