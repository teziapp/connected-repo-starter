import { useState } from "react";
import { trpc, queryClient } from "../App";

export function CreateUserForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const createUserMutation = trpc.user.create.useMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [["user", "getAll"]] });
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
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !email.trim()) {
			setError("Name and email are required");
			return;
		}

		createUserMutation.mutate({ name: name.trim(), email: email.trim() });
	};

	return (
		<div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "5px", margin: "20px 0" }}>
			<h3>Create New User</h3>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: "10px" }}>
					<label htmlFor="name">Name:</label>
					<input
						id="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
						disabled={createUserMutation.isPending}
					/>
				</div>
				<div style={{ marginBottom: "10px" }}>
					<label htmlFor="email">Email:</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						style={{ marginLeft: "10px", padding: "5px", width: "200px" }}
						disabled={createUserMutation.isPending}
					/>
				</div>
				<button
					type="submit"
					disabled={createUserMutation.isPending}
					style={{
						padding: "8px 16px",
						backgroundColor: "#007bff",
						color: "white",
						border: "none",
						borderRadius: "3px",
						cursor: createUserMutation.isPending ? "not-allowed" : "pointer",
					}}
				>
					{createUserMutation.isPending ? "Creating..." : "Create User"}
				</button>
			</form>
			{error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
			{success && <div style={{ color: "green", marginTop: "10px" }}>{success}</div>}
		</div>
	);
}
