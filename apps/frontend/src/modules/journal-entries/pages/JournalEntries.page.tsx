import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { ToggleButton } from "@connected-repo/ui-mui/form/ToggleButton";
import { ToggleButtonGroup } from "@connected-repo/ui-mui/form/ToggleButtonGroup";
import { GridViewIcon } from "@connected-repo/ui-mui/icons/GridViewIcon";
import { TableRowsIcon } from "@connected-repo/ui-mui/icons/TableRowsIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Pagination } from "@connected-repo/ui-mui/navigation/Pagination";
import { JournalEntriesEmptyState } from "@frontend/components/JournalEntriesEmptyState";
import { JournalEntryCardView } from "@frontend/components/JournalEntryCardView";
import { JournalEntryTableView } from "@frontend/components/JournalEntryTableView";
import { orpc } from "@frontend/utils/orpc.client";
import { useMediaQuery, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

const ITEMS_PER_PAGE = 12;

type ViewMode = "card" | "table";

export default function JournalEntriesPage() {
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const [viewMode, setViewMode] = useState<ViewMode>("card");
	const [currentPage, setCurrentPage] = useState(1);

	const { data: journalEntries, isLoading, error } = useQuery(orpc.journalEntries.getAll.queryOptions());

	const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
		if (newMode !== null) {
			setViewMode(newMode);
			setCurrentPage(1);
		}
	};

	const handleEntryClick = (entryId: string) => {
		navigate(`/journal-entries/${entryId}`);
	};

	const paginatedEntries = useMemo(() => {
		if (!journalEntries) return [];
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		return journalEntries.slice(startIndex, endIndex);
	}, [journalEntries, currentPage]);

	const totalPages = useMemo(() => {
		if (!journalEntries) return 0;
		return Math.ceil(journalEntries.length / ITEMS_PER_PAGE);
	}, [journalEntries]);

	if (isLoading) return <LoadingSpinner text="Loading journal entries..." />;

	if (error) {
		const errorMessage = `${error.name} - ${error.message}`;
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<ErrorAlert message={`Error loading journal entries: ${errorMessage}`} />
			</Container>
		);
	}

	if (!journalEntries || journalEntries.length === 0) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<JournalEntriesEmptyState />
			</Container>
		);
	}

	return (
		<Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
			{/* Header Section */}
			<Box
				sx={{
					mb: 5,
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					gap: 3,
				}}
			>
				<Box>
					<Typography
						variant="h3"
						component="h1"
						sx={{
							fontSize: { xs: "2rem", md: "2.5rem" },
							fontWeight: 700,
							color: "text.primary",
							mb: 1,
							letterSpacing: "-0.01em",
						}}
					>
						My Journal
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
						{journalEntries.length} {journalEntries.length === 1 ? "entry" : "entries"} in total
					</Typography>
				</Box>

				{/* View Toggle */}
				<ToggleButtonGroup
					value={viewMode}
					exclusive
					onChange={handleViewModeChange}
					aria-label="view mode"
					sx={{
						bgcolor: "background.paper",
						boxShadow: 1,
						borderRadius: 1.5,
						"& .MuiToggleButton-root": {
							px: { xs: 1.5, md: 2.5 },
							py: 1,
							border: "none",
							minWidth: { xs: 44, md: "auto" },
							fontSize: "0.875rem",
							fontWeight: 500,
							textTransform: "none",
							color: "text.secondary",
							transition: "all 0.2s ease-in-out",
							"&:hover": {
								bgcolor: "action.hover",
								color: "text.primary",
							},
							"&.Mui-selected": {
								bgcolor: "primary.main",
								color: "primary.contrastText",
								"&:hover": {
									bgcolor: "primary.dark",
								},
							},
						},
					}}
				>
					<ToggleButton value="card" aria-label="card view">
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<GridViewIcon sx={{ fontSize: 20 }} />
							{!isMobile && <span>Card View</span>}
						</Box>
					</ToggleButton>
					<ToggleButton value="table" aria-label="table view">
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<TableRowsIcon sx={{ fontSize: 20 }} />
							{!isMobile && <span>Table View</span>}
						</Box>
					</ToggleButton>
				</ToggleButtonGroup>
			</Box>

			{/* Content Section */}
			<Box sx={{ mb: 4 }}>
				{viewMode === "card" ? (
					<JournalEntryCardView entries={paginatedEntries} onEntryClick={handleEntryClick} />
				) : (
					<JournalEntryTableView entries={paginatedEntries} onEntryClick={handleEntryClick} />
				)}
			</Box>

			{/* Pagination */}
			{totalPages > 1 && (
				<Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
					<Pagination
						count={totalPages}
						page={currentPage}
						onChange={(_event: React.ChangeEvent<unknown>, page: number) => setCurrentPage(page)}
						color="primary"
						size="large"
						showFirstButton
						showLastButton
						sx={{
							"& .MuiPaginationItem-root": {
								fontSize: "1rem",
								fontWeight: 500,
								transition: "all 0.2s ease-in-out",
								"&:hover": {
									transform: "translateY(-2px)",
								},
							},
						}}
					/>
				</Box>
			)}
		</Container>
	);
}
