import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { List, ListItem } from "@connected-repo/ui-mui/data-display/List";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card, CardContent } from "@connected-repo/ui-mui/layout/Card";
import { orpc } from "@frontend/utils/orpc.client";
import { useQuery } from "@tanstack/react-query";

export function JournalEntryList() {
	const { data: journalEntries, isLoading, error } = useQuery(orpc.journalEntries.getAll.queryOptions());

	if (isLoading) return <LoadingSpinner text="Loading journal entries..." />;

	if (error) {
		const errorMessage = `${error.name} - ${error.message}`;
		return <ErrorAlert message={`Error loading journal entries: ${errorMessage}`} />;
	}

	return (
		<Box sx={{ mt: 3 }}>
			<Typography variant="h5" component="h2" gutterBottom>
				Journal Entries
			</Typography>
			{journalEntries && journalEntries.length > 0 ? (
				<List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
					{journalEntries.map((entry) => (
						<ListItem key={entry.journalEntryId} sx={{ p: 0 }}>
							<Card sx={{ width: "100%", border: "1px solid", borderColor: "divider" }}>
								<CardContent>
									<Typography variant="h6" component="h3" gutterBottom color="primary">
										{entry.prompt}
									</Typography>
									<Typography variant="body1" paragraph>
										{entry.content}
									</Typography>
									<Box sx={{ mt: 1.5 }}>
										<Typography variant="body2" color="text.secondary">
											By: {entry.author?.name} ({entry.author?.email})
										</Typography>
										<Typography variant="body2" color="text.secondary">
											Created: {new Date(entry.createdAt).toLocaleDateString()}
										</Typography>
									</Box>
								</CardContent>
							</Card>
						</ListItem>
					))}
				</List>
			) : (
				<Typography variant="body1" color="text.secondary">
					No journal entries found. Start writing your first entry!
				</Typography>
			)}
		</Box>
	);
}
