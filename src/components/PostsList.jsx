export const PostsList = ({ posts }) => {
	if (!posts.length) return null;

	return (
		<ul className="posts">
			{posts.map((post) => (
				<li key={post.id}>
					<strong>{post.title}</strong>
					<p>{post.body}</p>
				</li>
			))}
		</ul>
	);
};
