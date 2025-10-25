import { trpc } from "../App";

export function UserList() {
	const { data: users, isLoading, error } = trpc.user.getAll.useQuery();

	if (isLoading) return <div>Loading users...</div>;
	if (error) {
		const errorMessage = error.data?.userFriendlyMessage || error.message;
		return (
			<div
				style={{
					color: "red",
					padding: "10px",
					border: "1px solid #ffcdd2",
					borderRadius: "5px",
					backgroundColor: "#ffebee",
				}}
			>
				Error loading users: {errorMessage}
			</div>
		);
	}

	return (
		<div>
			<h2>Users</h2>
			{users && users.length > 0 ? (
				<div>
					{users.map((user) => (
						<div key={user.id} style={{ padding: "10px", border: "1px solid #ccc", margin: "10px 0" }}>
							<h3>{user.name}</h3>
							<p>Email: {user.email}</p>
							<p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
						</div>
					))}
				</div>
			) : (
				<p>No users found</p>
			)}
		</div>
	);
}
