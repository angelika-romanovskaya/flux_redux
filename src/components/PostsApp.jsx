import { useDispatch, useSelector } from "react-redux";
import { clearPosts, fetchPosts } from "../redux/posts/actions";

export default function PostsApp() {
	const { posts, loading, error } = useSelector((state) => state.posts);
	const dispatch = useDispatch();

	const handleLoad = () => dispatch(fetchPosts());
	const handleRetry = () => dispatch(fetchPosts());
	const handleClear = () => dispatch(clearPosts());

	return (
		<div className="app-section">
			<h2>Posts</h2>

			<div className="controls">
				<button onClick={handleLoad} disabled={loading}>
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
					<button onClick={handleRetry}>Повторить запрос</button>
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
