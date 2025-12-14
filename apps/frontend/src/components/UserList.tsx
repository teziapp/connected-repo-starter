import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { List, ListItem } from "@connected-repo/ui-mui/data-display/List";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card, CardContent } from "@connected-repo/ui-mui/layout/Card";
import { orpc } from "@frontend/utils/orpc.client";
import { useQuery } from "@tanstack/react-query";

export function UserList() {
	const { data: users, isLoading, error } = useQuery(orpc.users.getAll.queryOptions());

	if (isLoading) return <LoadingSpinner text="Loading users..." />;

	if (error) {
		const errorMessage = `${error.name} - ${error.message}`;
		return <ErrorAlert message={`Error loading users: ${errorMessage}`} />;
	}

	return (
		<Box sx={{ mt: 3 }}>
			<Typography variant="h5" component="h2" gutterBottom>
				Users
			</Typography>
			{users && users.length > 0 ? (
				<List sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
					{users.map((user) => (
						<ListItem key={user.id} sx={{ p: 0 }}>
							<Card sx={{ width: "100%", border: "1px solid", borderColor: "divider" }}>
								<CardContent>
									<Typography variant="h6" component="h3" gutterBottom>
										{user.name}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Email: {user.email}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Created: {new Date(user.createdAt).toLocaleDateString()}
									</Typography>
								</CardContent>
							</Card>
						</ListItem>
					))}
				</List>
			) : (
				<Typography variant="body1" color="text.secondary">
					No users found
				</Typography>
			)}
		</Box>
	);
}
