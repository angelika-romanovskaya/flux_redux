import { useDispatch, useSelector } from "react-redux";
import {
	clearPosts,
	fetchPosts,
	selectError,
	selectLoading,
	selectPosts,
} from "../redux-toolkit/posts/posts-slice";

export default function PostsApp() {
	const posts = useSelector(selectPosts);
	const loading = useSelector(selectLoading);
	const error = useSelector(selectError);
	const dispatch = useDispatch();

	const handleClear = () => dispatch(clearPosts());
	const handleFetch = () => dispatch(fetchPosts());

	return (
		<div className="app-section">
			<h2>Posts</h2>

			<div className="controls">
				<button onClick={handleFetch} disabled={loading}>
					Загрузить данные
				</button>
				{posts.length > 0 && (
					<button onClick={handleClear} disabled={loading}>
						Очистить
					</button>
				)}
			</div>

			{loading && <p className="status">Загрузка…</p>}

			{error && !loading && (
				<div className="status error">
					<p>Ошибка: {error}</p>
					<button onClick={handleFetch}>Повторить запрос</button>
				</div>
			)}

			{!loading && !error && posts.length > 0 && (
				<ul className="posts">
					{posts.map((post) => (
						<li key={post.id}>
							<strong>{post.title}</strong>
							<p>{post.body}</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
