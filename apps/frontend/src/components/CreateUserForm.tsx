import { ContentCard } from "@connected-repo/ui-mui/components/ContentCard";
import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { PrimaryButton } from "@connected-repo/ui-mui/components/PrimaryButton";
import { SuccessAlert } from "@connected-repo/ui-mui/components/SuccessAlert";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { TextField } from "@connected-repo/ui-mui/form/TextField";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { orpc } from "@frontend/utils/orpc.client";
import { queryClient } from "@frontend/utils/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export function CreateUserForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const createUserMutation = useMutation(orpc.users.create.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: orpc.users.getAll.queryKey() });
			setName("");
			setEmail("");
			setSuccess("User created successfully!");
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
		if (!name.trim() || !email.trim()) {
			setError("Name and email are required");
			return;
		}

		createUserMutation.mutate({ name: name.trim(), email: email.trim() });
	};

	return (
		<ContentCard>
			<Typography variant="h5" component="h3" gutterBottom>
				Create New User
			</Typography>
			<form onSubmit={handleSubmit}>
				<Stack spacing={2}>
					<TextField
						label="Name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={createUserMutation.isPending}
						fullWidth
						required
					/>
					<TextField
						label="Email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={createUserMutation.isPending}
						fullWidth
						required
					/>
					<PrimaryButton
						type="submit"
						loading={createUserMutation.isPending}
					>
						Create User
					</PrimaryButton>
				</Stack>
			</form>
			<ErrorAlert message={error} />
			<SuccessAlert message={success} />
		</ContentCard>
	);
}
