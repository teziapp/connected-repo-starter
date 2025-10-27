import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Grid } from "@connected-repo/ui-mui/layout/Grid";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { useQuery } from "@tanstack/react-query";
import { CreatePostForm } from "@frontend/components/CreatePostForm";
import { CreateUserForm } from "@frontend/components/CreateUserForm";
import { PostList } from "@frontend/components/PostList";
import { UserList } from "@frontend/components/UserList";
import { trpc } from "@frontend/utils/trpc.client";

const DatabaseDemo = () => {
	const { data: hello } = useQuery(trpc.hello.queryOptions());

	return (
		<Container maxWidth="lg" sx={{ py: 3 }}>
			<Typography variant="h3" component="h1" gutterBottom>
				tRPC + Orchid ORM Database Demo
			</Typography>

			<Paper sx={{ p: 1.5, mb: 3, bgcolor: "background.paper" }}>
				<Typography variant="body1">
					<strong>Connection Status:</strong> {hello || "Loading..."}
				</Typography>
			</Paper>

			<Grid container spacing={4}>
				<Grid size={{ xs: 12, md: 6 }}>
					<CreateUserForm />
					<UserList />
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<CreatePostForm />
					<PostList />
				</Grid>
			</Grid>

			<Paper sx={{ mt: 5, p: 2.5, bgcolor: "#e7f3ff" }}>
				<Typography variant="h5" component="h3" gutterBottom>
					Features Demonstrated:
				</Typography>
				<Box component="ul" sx={{ m: 0 }}>
					<li>tRPC client-server communication with full TypeScript type safety</li>
					<li>Orchid ORM database queries with PostgreSQL</li>
					<li>Centralized error handling and formatting</li>
					<li>Real-time UI updates using React Query invalidation</li>
					<li>Form validation and error display</li>
					<li>Database relations (User ↔ Posts)</li>
				</Box>
			</Paper>
		</Container>
	);
}

export default DatabaseDemo;