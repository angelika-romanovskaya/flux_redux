import { useDispatch, useSelector } from "react-redux";
import { clearPosts, fetchPosts } from "../redux-toolkit/posts/posts-slice";
import { selectPostsState } from "../redux-toolkit/posts/create-selector";

export default function PostsApp() {
	const { posts, loading, error, isEmpty, hasError, showList } =
		useSelector(selectPostsState);
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
				{!isEmpty && (
					<button onClick={handleClear} disabled={loading}>
						Очистить
					</button>
				)}
			</div>

			{loading && <p className="status">Загрузка…</p>}

			{hasError && (
				<div className="status error">
					<p>Ошибка: {error}</p>
					<button onClick={handleFetch}>Повторить запрос</button>
				</div>
			)}

			{showList && (
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
