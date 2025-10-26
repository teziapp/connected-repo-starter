import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient } from "../utils/queryClient";
import { trpc } from "../utils/trpc.client";

export function CreatePostForm() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [authorId, setAuthorId] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const { data: users } = useQuery(trpc.user.getAll.queryOptions())

	const createPostMutation = useMutation(trpc.post.create.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.post.getAll.queryKey() });
			setTitle("");
			setContent("");
			setAuthorId("");
			setSuccess("Post created successfully!");
			setError("");
			setTimeout(() => setSuccess(""), 3000);
		},
		onError: (error) => {
			// Use the user-friendly message from our centralized error handling
			const errorMessage = error.data?.userFriendlyMessage || error.message;
			const actionRequired = error.data?.actionRequired;

			setError(actionRequired ? `${errorMessage} - ${actionRequired}` : errorMessage);
			setSuccess("");
		},
	}));

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !content.trim() || !authorId) {
			setError("Title, content, and author are required");
			return;
		}

		createPostMutation.mutate({
			title: title.trim(),
			content: content.trim(),
			authorId,
		});
	};

	return (
		<div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "5px", margin: "20px 0" }}>
			<h3>Create New Post</h3>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: "10px" }}>
					<label htmlFor="title">Title:</label>
					<input
						id="title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						style={{ marginLeft: "10px", padding: "5px", width: "300px" }}
						disabled={createPostMutation.isPending}
					/>
				</div>
				<div style={{ marginBottom: "10px" }}>
					<label htmlFor="content">Content:</label>
					<textarea
						id="content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						style={{ marginLeft: "10px", padding: "5px", width: "300px", height: "100px" }}
						disabled={createPostMutation.isPending}
					/>
				</div>
				<div style={{ marginBottom: "10px" }}>
					<label htmlFor="author">Author:</label>
					<select
						id="author"
						value={authorId}
						onChange={(e) => setAuthorId(e.target.value)}
						style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
						disabled={createPostMutation.isPending}
					>
						<option value="">Select an author</option>
						{users?.map((user) => (
							<option key={user.id} value={user.id}>
								{user.name} ({user.email})
							</option>
						))}
					</select>
				</div>
				<button
					type="submit"
					disabled={createPostMutation.isPending}
					style={{
						padding: "8px 16px",
						backgroundColor: "#28a745",
						color: "white",
						border: "none",
						borderRadius: "3px",
						cursor: createPostMutation.isPending ? "not-allowed" : "pointer",
					}}
				>
					{createPostMutation.isPending ? "Creating..." : "Create Post"}
				</button>
			</form>
			{error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
			{success && <div style={{ color: "green", marginTop: "10px" }}>{success}</div>}
		</div>
	);
}
