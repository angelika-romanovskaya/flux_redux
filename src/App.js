import { useState } from "react";
import TodoApp from "./components/TodoApp";
import PostsApp from "./components/PostsApp";

const TABS = {
	TODOS: "todos",
	POSTS: "posts",
};

export default function App() {
	const [tab, setTab] = useState(TABS.TODOS);

	return (
		<div className="app">
			<h1>react-hw</h1>

			<div className="tabs">
				<button
					className={tab === TABS.TODOS ? "tab active" : "tab"}
					onClick={() => setTab(TABS.TODOS)}
				>
					Задачи
				</button>
				<button
					className={tab === TABS.POSTS ? "tab active" : "tab"}
					onClick={() => setTab(TABS.POSTS)}
				>
					Posts
				</button>
			</div>

			<div className="tab-content">
				{tab === TABS.TODOS && <TodoApp />}
				{tab === TABS.POSTS && <PostsApp />}
			</div>
		</div>
	);
}
