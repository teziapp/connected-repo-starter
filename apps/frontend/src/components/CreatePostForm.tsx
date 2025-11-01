import { ContentCard } from "@connected-repo/ui-mui/components/ContentCard";
import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { PrimaryButton } from "@connected-repo/ui-mui/components/PrimaryButton";
import { SuccessAlert } from "@connected-repo/ui-mui/components/SuccessAlert";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { FormControl, InputLabel } from "@connected-repo/ui-mui/form/FormControl";
import { MenuItem } from "@connected-repo/ui-mui/form/MenuItem";
import { Select } from "@connected-repo/ui-mui/form/Select";
import { TextField } from "@connected-repo/ui-mui/form/TextField";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { queryClient } from "@frontend/utils/queryClient";
import { trpc } from "@frontend/utils/trpc.client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function CreatePostForm() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [authorUserId, setAuthorId] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const { data: users } = useQuery(trpc.users.getAll.queryOptions())

	const createPostMutation = useMutation(trpc.posts.create.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.posts.getAll.queryKey() });
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
		if (!title.trim() || !content.trim() || !authorUserId) {
			setError("Title, content, and author are required");
			return;
		}

		createPostMutation.mutate({
			title: title.trim(),
			content: content.trim(),
			authorUserId,
		});
	};

	return (
		<ContentCard>
			<Typography variant="h5" component="h3" gutterBottom>
				Create New Post
			</Typography>
			<form onSubmit={handleSubmit}>
				<Stack spacing={2}>
					<TextField
						label="Title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						disabled={createPostMutation.isPending}
						fullWidth
						required
					/>
					<TextField
						label="Content"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						disabled={createPostMutation.isPending}
						fullWidth
						required
						multiline
						rows={4}
					/>
					<FormControl fullWidth required>
						<InputLabel id="author-label">Author</InputLabel>
						<Select
							labelId="author-label"
							value={authorUserId}
							onChange={(e) => setAuthorId(e.target.value)}
							disabled={createPostMutation.isPending}
							label="Author"
						>
							<MenuItem value="">
								<em>Select an author</em>
							</MenuItem>
							{users?.map((user) => (
								<MenuItem key={user.userId} value={user.userId}>
									{user.name} ({user.email})
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<PrimaryButton
						type="submit"
						variant="contained"
						color="success"
						disabled={createPostMutation.isPending}
					>
						{createPostMutation.isPending ? "Creating..." : "Create Post"}
					</PrimaryButton>
				</Stack>
			</form>
			<ErrorAlert message={error} />
			<SuccessAlert message={success} />
		</ContentCard>
	);
}
