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

export function CreateJournalEntryForm() {
	const [promptId, setPromptId] = useState("");
	const [prompt, setPrompt] = useState("");
	const [content, setContent] = useState("");
	const [authorUserId, setAuthorId] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const { data: users } = useQuery(trpc.users.getAll.queryOptions())
	const { data: prompts = [] } = useQuery(trpc.prompts.getActive.queryOptions({ isActive: true }))

	const createPromptMutation = useMutation(trpc.prompts.create.mutationOptions());

	const createJournalEntryMutation = useMutation(trpc.journalEntries.create.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.journalEntries.getAll.queryKey() });
			setPromptId("");
			setPrompt("");
			setContent("");
			setAuthorId("");
			setSuccess("Journal entry created successfully!");
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

	const handlePromptSelect = (selectedPromptId: string) => {
		setPromptId(selectedPromptId);
		const selectedPrompt = prompts.find(p => p.promptId === selectedPromptId);
		if (selectedPrompt) {
			setPrompt(selectedPrompt.text);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!prompt.trim() || !content.trim() || !authorUserId) {
			setError("Prompt, content, and author are required");
			return;
		}

		try {
			let finalPromptId = promptId;

			// If no prompt selected, create a new one
			if (!finalPromptId) {
				const newPrompt = await createPromptMutation.mutateAsync({
					text: prompt.trim(),
					isActive: true,
				});
				finalPromptId = newPrompt.promptId;
			}

			createJournalEntryMutation.mutate({
				promptId: finalPromptId,
				prompt: prompt.trim(),
				content: content.trim(),
			});
		} catch (err) {
			setError("Failed to create prompt");
		}
	};

	return (
		<ContentCard>
			<Typography variant="h5" component="h3" gutterBottom>
				Create New Journal Entry
			</Typography>
			<form onSubmit={handleSubmit}>
				<Stack spacing={2}>
					<FormControl fullWidth>
						<InputLabel id="prompt-label">Select Existing Prompt (Optional)</InputLabel>
						<Select
							labelId="prompt-label"
							value={promptId}
							onChange={(e) => handlePromptSelect(e.target.value)}
							disabled={createJournalEntryMutation.isPending}
							label="Select Existing Prompt (Optional)"
						>
							<MenuItem value="">
								<em>Type a new prompt below</em>
							</MenuItem>
							{prompts?.map((p) => (
								<MenuItem key={p.promptId} value={p.promptId}>
									{p.text}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField
						label="Prompt / Question"
						type="text"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						disabled={createJournalEntryMutation.isPending}
						fullWidth
						required
						placeholder="What question are you answering today?"
						helperText={promptId ? "Selected prompt (you can edit it)" : "Type a new prompt or select one above"}
					/>
					<TextField
						label="Your Response"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						disabled={createJournalEntryMutation.isPending}
						fullWidth
						required
						multiline
						rows={6}
						placeholder="Write your thoughts here..."
						helperText="Your journal entry content"
					/>
					<FormControl fullWidth required>
						<InputLabel id="author-label">Author</InputLabel>
						<Select
							labelId="author-label"
							value={authorUserId}
							onChange={(e) => setAuthorId(e.target.value)}
							disabled={createJournalEntryMutation.isPending}
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
						disabled={createJournalEntryMutation.isPending}
					>
						{createJournalEntryMutation.isPending ? "Creating..." : "Create Entry"}
					</PrimaryButton>
				</Stack>
			</form>
			<ErrorAlert message={error} />
			<SuccessAlert message={success} />
		</ContentCard>
	);
}
