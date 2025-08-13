import { trpc } from "../App";

export function PostList() {
	const { data: posts, isLoading, error } = trpc.post.getAll.useQuery();

	if (isLoading) return <div>Loading posts...</div>;
	if (error) {
		const errorMessage = error.data?.userFriendlyMessage || error.message;
		return <div style={{ color: "red", padding: "10px", border: "1px solid #ffcdd2", borderRadius: "5px", backgroundColor: "#ffebee" }}>
			Error loading posts: {errorMessage}
		</div>;
	}

	return (
		<div>
			<h2>Posts</h2>
			{posts && posts.length > 0 ? (
				<div>
					{posts.map((post) => (
						<div key={post.id} style={{ padding: "15px", border: "1px solid #ddd", margin: "15px 0", borderRadius: "5px" }}>
							<h3>{post.title}</h3>
							<p>{post.content}</p>
							<div style={{ fontSize: "0.9em", color: "#666", marginTop: "10px" }}>
								<p>By: {post.author?.name} ({post.author?.email})</p>
								<p>Created: {new Date(post.createdAt).toLocaleDateString()}</p>
							</div>
						</div>
					))}
				</div>
			) : (
				<p>No posts found</p>
			)}
		</div>
	);
}