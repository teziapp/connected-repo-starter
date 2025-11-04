import { CreateJournalEntryForm } from "@frontend/components/CreateJournalEntryForm";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";

export default function CreateJournalEntryPage() {
	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					New Journal Entry
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Write your thoughts and reflections
				</Typography>
			</Box>
			<CreateJournalEntryForm />
		</Container>
	);
}
