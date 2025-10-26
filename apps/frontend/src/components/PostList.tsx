import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import ErrorAlert from "../../../../packages/ui-mui/dist/components/ErrorAlert";
import LoadingSpinner from "../../../../packages/ui-mui/dist/components/LoadingSpinner";
import { trpc } from "../utils/trpc.client";

export function PostList() {
	const { data: posts, isLoading, error } = useQuery(trpc.post.getAll.queryOptions());

	if (isLoading) return <LoadingSpinner text="Loading posts..." />;

	if (error) {
		const errorMessage = error.data?.userFriendlyMessage || error.message;
		return <ErrorAlert message={`Error loading posts: ${errorMessage}`} />;
	}

	return (
		<Box sx={{ mt: 3 }}>
			<Typography variant="h5" component="h2" gutterBottom>
				Posts
			</Typography>
			{posts && posts.length > 0 ? (
				<List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
					{posts.map((post) => (
						<ListItem key={post.id} sx={{ p: 0 }}>
							<Card sx={{ width: "100%", border: "1px solid", borderColor: "divider" }}>
								<CardContent>
									<Typography variant="h6" component="h3" gutterBottom>
										{post.title}
									</Typography>
									<Typography variant="body1" paragraph>
										{post.content}
									</Typography>
									<Box sx={{ mt: 1.5 }}>
										<Typography variant="body2" color="text.secondary">
											By: {post.author?.name} ({post.author?.email})
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Created: {new Date(post.createdAt).toLocaleDateString()}
										</Typography>
									</Box>
								</CardContent>
							</Card>
						</ListItem>
					))}
				</List>
			) : (
				<Typography variant="body1" color="text.secondary">
					No posts found
				</Typography>
			)}
		</Box>
	);
}
