import { ContentCard } from "@connected-repo/ui-mui/components/ContentCard";
import { SuccessAlert } from "@connected-repo/ui-mui/components/SuccessAlert";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { IconButton } from "@connected-repo/ui-mui/navigation/IconButton";
import { CircularProgress } from "@connected-repo/ui-mui/feedback/CircularProgress";
import { RhfSubmitButton } from "@connected-repo/ui-mui/rhf-form/RhfSubmitButton";
import { RhfTextField } from "@connected-repo/ui-mui/rhf-form/RhfTextField";
import { useRhfForm } from "@connected-repo/ui-mui/rhf-form/useRhfForm";
import { JournalEntryCreateInput, journalEntryCreateInputZod } from "@connected-repo/zod-schemas/journal_entry.zod";
import { queryClient } from "@frontend/utils/queryClient";
import { trpc } from "@frontend/utils/trpc.client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export function CreateJournalEntryForm() {
	const [success, setSuccess] = useState("");

	// Fetch random prompt
	const {
		data: randomPrompt,
		isLoading: promptLoading,
		error: promptError,
		refetch: refetchPrompt,
	} = useQuery(trpc.prompts.getRandomActive.queryOptions());

	// Mutation with query invalidation
	const createJournalEntryMutation = useMutation(trpc.journalEntries.create.mutationOptions({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.journalEntries.getAll.queryKey() });
			formMethods.reset();
			setSuccess("Journal entry created successfully!");
			setTimeout(() => setSuccess(""), 3000);
			// Get a new prompt after successful submission
			refetchPrompt();
		},
	}));

	// Form setup with Zod validation and RHF
	const { formMethods, RhfFormProvider } = useRhfForm<JournalEntryCreateInput>({
		onSubmit: async (data) => {
			await createJournalEntryMutation.mutateAsync(data);
		},
		formConfig: {
			resolver: zodResolver(journalEntryCreateInputZod),
			defaultValues: {
				prompt: "",
				content: "",
			},
		},
	});

	// Auto-populate prompt when random prompt loads
	useEffect(() => {
		if (randomPrompt?.text) {
			formMethods.setValue("prompt", randomPrompt.text);
		}
	}, [randomPrompt, formMethods]);

	const handleRefreshPrompt = () => {
		refetchPrompt();
	};

	return (
		<ContentCard>
			<Typography variant="h5" component="h3" gutterBottom>
				Create New Journal Entry
			</Typography>

			<RhfFormProvider>
				<Stack spacing={3}>
					{/* Random Prompt Section */}
					<Paper
						elevation={0}
						sx={{
							p: 3,
							background: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
							borderRadius: 2,
							border: "1px solid",
							borderColor: "divider",
							position: "relative",
							overflow: "hidden",
							"&::before": {
								content: '""',
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								height: "2px",
								background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
							},
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								mb: 2,
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<AutoAwesomeIcon
									sx={{ color: "#667eea", fontSize: 18, opacity: 0.8 }}
								/>
								<Typography
									variant="overline"
									sx={{
										color: "text.secondary",
										fontWeight: 600,
										letterSpacing: "0.08em",
										fontSize: "0.65rem",
									}}
								>
									Today's Prompt
								</Typography>
							</Box>
							<IconButton
								onClick={handleRefreshPrompt}
								size="small"
								disabled={promptLoading}
								sx={{
									color: "primary.main",
									"&:hover": {
										backgroundColor: "action.hover",
										transform: "rotate(180deg)",
									},
									transition: "transform 0.3s ease",
								}}
								title="Get a new prompt"
							>
								<RefreshIcon fontSize="small" />
							</IconButton>
						</Box>

						{promptLoading ? (
							<Box
								sx={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									py: 3,
								}}
							>
								<CircularProgress size={24} />
							</Box>
						) : promptError ? (
							<Typography
								color="error"
								sx={{
									fontStyle: "italic",
									textAlign: "center",
									py: 2,
									fontSize: "0.9rem",
								}}
							>
								Unable to load prompt. Please try again.
							</Typography>
						) : (
							<Box>
								<Typography
									variant="body1"
									sx={{
										fontWeight: 400,
										color: "text.primary",
										lineHeight: 1.6,
										fontStyle: "italic",
										letterSpacing: "0.005em",
										px: 1,
									}}
								>
									"{randomPrompt?.text}"
								</Typography>
								{randomPrompt?.category && (
									<Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
										<Typography
											variant="caption"
											sx={{
												color: "text.secondary",
												fontWeight: 500,
												px: 1.5,
												py: 0.5,
												backgroundColor: "background.paper",
												borderRadius: 1,
												textTransform: "uppercase",
												letterSpacing: "0.05em",
												fontSize: "0.6rem",
											}}
										>
											{randomPrompt.category}
										</Typography>
									</Box>
								)}
							</Box>
						)}
					</Paper>

					{/* Hidden prompt field - auto-populated, read-only */}
					<input type="hidden" {...formMethods.register("prompt")} />

					<RhfTextField
						name="content"
						label="Your Response"
						multiline
						rows={8}
						placeholder="Write your thoughts here..."
						helperText="Share your reflections on the prompt above"
						sx={{ mb: 0 }}
					/>

					<RhfSubmitButton
						notSubmittingText="Create Entry"
						isSubmittingText="Creating..."
						props={{
							variant: "contained",
							color: "success",
							fullWidth: true,
						}}
					/>
				</Stack>
			</RhfFormProvider>

			<SuccessAlert message={success} />
		</ContentCard>
	);
}
