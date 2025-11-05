import { JournalEntryList } from "@frontend/components/JournalEntryList";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";

export default function JournalEntriesPage() {
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					My Journal Entries
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Browse your journal entries and reflections
				</Typography>
			</Box>
			<JournalEntryList />
		</Container>
	);
}
