import { ContentCard } from "@connected-repo/ui-mui/components/ContentCard";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { SuccessAlert } from "@connected-repo/ui-mui/components/SuccessAlert";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Collapse } from "@connected-repo/ui-mui/feedback/Collapse";
import { ToggleButton } from "@connected-repo/ui-mui/form/ToggleButton";
import { ToggleButtonGroup } from "@connected-repo/ui-mui/form/ToggleButtonGroup";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { IconButton } from "@connected-repo/ui-mui/navigation/IconButton";
import { RhfSubmitButton } from "@connected-repo/ui-mui/rhf-form/RhfSubmitButton";
import { RhfTextField } from "@connected-repo/ui-mui/rhf-form/RhfTextField";
import { useRhfForm } from "@connected-repo/ui-mui/rhf-form/useRhfForm";
import { JournalEntryCreateInput, journalEntryCreateInputZod } from "@connected-repo/zod-schemas/journal_entry.zod";
import { orpc, orpcFetch } from "@frontend/utils/orpc.client";
import { zodResolver } from "@hookform/resolvers/zod";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EditNoteIcon from "@mui/icons-material/EditNote";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type WritingMode = "prompted" | "free";

export function CreateJournalEntryForm() {
	const [success, setSuccess] = useState("");
	const [writingMode, setWritingMode] = useState<WritingMode>("prompted");

	// Fetch random prompt
	const {
		data: randomPrompt,
		isLoading: promptLoading,
		error: promptError,
		refetch: refetchPrompt,
	} = useQuery(orpc.prompts.getRandomActive.queryOptions());

	// Form setup with Zod validation and RHF
	const { formMethods, RhfFormProvider } = useRhfForm<JournalEntryCreateInput>({
		onSubmit: async (data) => {
			// Set prompt to null if in free writing mode
			const submitData = {
				...data,
				prompt: writingMode === "free" ? null : data.prompt,
				promptId: writingMode === "free"? null : randomPrompt?.promptId ?? null
			};
			await orpcFetch.journalEntries.create(submitData);
			formMethods.reset();
			setSuccess("Journal entry created successfully!");
			setTimeout(() => setSuccess(""), 3000);
			// Get a new prompt after successful submission if in prompted mode
			if (writingMode === "prompted") {
				refetchPrompt();
			}
		},
		formConfig: {
			resolver: zodResolver(journalEntryCreateInputZod),
			defaultValues: {
				prompt: null,
				content: undefined,
			},
		},
	});
	
	useEffect(() => {
		// Clear prompt when switching to free mode
		if (writingMode === "free") {
			formMethods.setValue("prompt", null);
		} 
		// Auto-populate prompt when random prompt loads and in prompted mode
		else if (writingMode === "prompted" && randomPrompt?.text) {
			formMethods.setValue("prompt", randomPrompt.text);
		}
	}, [writingMode, formMethods, randomPrompt]);

	const handleRefreshPrompt = () => {
		refetchPrompt();
	};

	const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: WritingMode | null) => {
		if (newMode !== null) {
			setWritingMode(newMode);
		}
	};

	return (
		<ContentCard>
			<Box
				sx={{
					display: "flex",
					flexDirection: { xs: "column", sm: "row" },
					justifyContent: "space-between",
					alignItems: { xs: "flex-start", sm: "center" },
					gap: { xs: 2, sm: 0 },
					mb: 3
				}}
			>
				<Typography
					variant="h5"
					component="h3"
					sx={{
						fontSize: { xs: "1.25rem", sm: "1.5rem" },
					}}
				>
					Create New Journal Entry
				</Typography>

				{/* Writing Mode Toggle */}
				<ToggleButtonGroup
					value={writingMode}
					exclusive
					onChange={handleModeChange}
					size="small"
					sx={{
						width: { xs: "100%", sm: "auto" },
						"& .MuiToggleButtonGroup-grouped": {
							flex: { xs: 1, sm: "initial" },
						},
						"& .MuiToggleButton-root": {
							px: { xs: 2.5, sm: 2, md: 2.5 },
							py: { xs: 1.25, sm: 0.75, md: 1 },
							minHeight: { xs: 44, sm: 36 },
							textTransform: "none",
							fontSize: { xs: "0.9375rem", sm: "0.8125rem", md: "0.875rem" },
							fontWeight: 500,
							border: "1px solid",
							borderColor: "divider",
							transition: "all 0.2s ease-in-out",
							color: "text.primary",
							"&.Mui-selected": {
								bgcolor: "primary.main",
								color: "primary.contrastText",
								borderColor: "primary.main",
								"&:hover": {
									bgcolor: "primary.dark",
								},
							},
							"&:not(.Mui-selected)": {
								bgcolor: "background.paper",
								"&:hover": {
									bgcolor: "action.hover",
									borderColor: "primary.main",
								},
							},
						},
					}}
				>
					<ToggleButton value="prompted">
						<AutoAwesomeIcon
							sx={{
								fontSize: { xs: 18, sm: 16, md: 17 },
								mr: { xs: 0.75, sm: 0.5 }
							}}
						/>
						Prompted
					</ToggleButton>
					<ToggleButton value="free">
						<EditNoteIcon
							sx={{
								fontSize: { xs: 20, sm: 18, md: 19 },
								mr: { xs: 0.75, sm: 0.5 }
							}}
						/>
						Free Write
					</ToggleButton>
				</ToggleButtonGroup>
			</Box>

			<RhfFormProvider>
				<Stack spacing={3}>
					{/* Random Prompt Section - Only show in prompted mode */}
					<Collapse in={writingMode === "prompted"} timeout={300}>
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
								<LoadingSpinner size={24} />
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
					</Collapse>

					{/* Hidden prompt field - auto-populated, read-only */}
					<input type="hidden" {...formMethods.register("prompt")} />

					<RhfTextField
						name="content"
						label={writingMode === "prompted" ? "Your Response" : "Your Thoughts"}
						multiline
						rows={8}
						placeholder={writingMode === "prompted"
							? "Write your thoughts here..."
							: "Write freely about anything on your mind..."
						}
						helperText={writingMode === "prompted"
							? "Share your reflections on the prompt above"
							: "Express yourself freely without any prompts or constraints"
						}
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
