import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Alert } from "@connected-repo/ui-mui/feedback/Alert";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@connected-repo/ui-mui/feedback/Dialog";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { TextField } from "@connected-repo/ui-mui/form/TextField";
import { ArrowBackIcon } from "@connected-repo/ui-mui/icons/ArrowBackIcon";
import { CalendarTodayIcon } from "@connected-repo/ui-mui/icons/CalendarTodayIcon";
import { DeleteIcon } from "@connected-repo/ui-mui/icons/DeleteIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card, CardContent } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Divider } from "@connected-repo/ui-mui/layout/Divider";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { orpc } from "@frontend/utils/orpc.client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

export default function JournalEntryDetailPage() {
	const navigate = useNavigate();
	const { entryId } = useParams<{ entryId: string }>();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [confirmationText, setConfirmationText] = useState("");
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const { data: journalEntry, isLoading, error } = useQuery(
		orpc.journalEntries.getById.queryOptions({ input: { journalEntryId: entryId || "" }})
	);

	const deleteMutation = useMutation(orpc.journalEntries.delete.mutationOptions());

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
		setConfirmationText("");
		setDeleteError(null);
	};

	const handleDeleteConfirm = async () => {
		if (confirmationText.toLowerCase() !== "delete") {
			setDeleteError('Please type "DELETE" to confirm');
			return;
		}

		try {
			await deleteMutation.mutateAsync({ journalEntryId: entryId || "" });
			navigate("/journal-entries", { replace: true });
		} catch (error) {
			setDeleteError("Failed to delete journal entry. Please try again.");
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setConfirmationText("");
		setDeleteError(null);
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (isLoading) return <LoadingSpinner text="Loading journal entry..." />;

	if (error) {
		const errorMessage = `${error.name} - ${error.message}`;
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<ErrorAlert message={`Error loading journal entry: ${errorMessage}`} />
			</Container>
		);
	}

	if (!journalEntry) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Alert severity="error">Journal entry not found</Alert>
			</Container>
		);
	}

	return (
		<Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
			{/* Back Button */}
			<Button
				startIcon={<ArrowBackIcon />}
				onClick={() => navigate("/journal-entries")}
				sx={{
					mb: 3,
					color: "text.secondary",
					"&:hover": {
						color: "primary.main",
						bgcolor: "action.hover",
					},
				}}
			>
				Back to Journal Entries
			</Button>

			{/* Main Card */}
			<Card
				sx={{
					boxShadow: 3,
					borderRadius: 2,
					border: "1px solid",
					borderColor: "divider",
					transition: "box-shadow 0.3s ease-in-out",
					"&:hover": {
						boxShadow: 6,
					},
				}}
			>
				<CardContent sx={{ p: { xs: 3, md: 4 } }}>
					{/* Header Section */}
					<Stack
						direction={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems={{ xs: "flex-start", sm: "center" }}
						spacing={2}
						sx={{ mb: 3 }}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<CalendarTodayIcon sx={{ fontSize: 20, color: "text.secondary" }} />
							<Typography variant="body2" color="text.secondary">
								{formatDate(journalEntry.createdAt)}
							</Typography>
						</Box>
						<Button
							variant="outlined"
							color="error"
							startIcon={<DeleteIcon />}
							onClick={handleDeleteClick}
							sx={{
								transition: "all 0.2s ease-in-out",
								"&:hover": {
									transform: "translateY(-2px)",
									boxShadow: 2,
								},
							}}
						>
							Delete Entry
						</Button>
					</Stack>

					<Divider sx={{ mb: 4 }} />

					{/* Prompt Section */}
					{journalEntry.prompt && (
						<Box sx={{ mb: 4 }}>
							<Typography
								variant="overline"
								color="primary.main"
								sx={{
									fontWeight: 600,
									letterSpacing: "0.1em",
									display: "block",
									mb: 1,
								}}
							>
								Prompt
							</Typography>
							<Box
								sx={{
									bgcolor: "primary.lighter",
									borderLeft: "4px solid",
									borderColor: "primary.main",
									p: 2,
									borderRadius: 1,
								}}
							>
								<Typography
									variant="body1"
									sx={{
										fontStyle: "italic",
										color: "text.primary",
										lineHeight: 1.7,
									}}
								>
									{journalEntry.prompt}
								</Typography>
							</Box>
						</Box>
					)}

					{/* Content Section */}
					<Box>
						<Typography
							variant="overline"
							color="text.secondary"
							sx={{
								fontWeight: 600,
								letterSpacing: "0.1em",
								display: "block",
								mb: 2,
							}}
						>
							Your Entry
						</Typography>
						<Typography
							variant="body1"
							sx={{
								whiteSpace: "pre-wrap",
								lineHeight: 1.8,
								color: "text.primary",
								fontSize: "1.05rem",
							}}
						>
							{journalEntry.content}
						</Typography>
					</Box>
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Delete Journal Entry?</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 3 }}>
						This action cannot be undone. To confirm deletion, please type{" "}
						<Typography component="span" fontWeight={600} color="error.main">
							DELETE
						</Typography>{" "}
						below.
					</DialogContentText>
					<TextField
						fullWidth
						label="Type DELETE to confirm"
						value={confirmationText}
						onChange={(e) => setConfirmationText(e.target.value)}
						error={!!deleteError}
						helperText={deleteError}
						autoFocus
						sx={{
							"& .MuiOutlinedInput-root": {
								"&.Mui-focused fieldset": {
									borderWidth: 2,
								},
							},
						}}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3 }}>
					<Button
						onClick={handleDeleteCancel}
						disabled={deleteMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						variant="contained"
						disabled={deleteMutation.isPending}
						sx={{
							transition: "all 0.2s ease-in-out",
							"&:hover": {
								transform: "translateY(-2px)",
								boxShadow: 4,
							},
						}}
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete Entry"}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
