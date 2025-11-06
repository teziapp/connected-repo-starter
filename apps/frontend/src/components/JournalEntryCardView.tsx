import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card, CardContent } from "@connected-repo/ui-mui/layout/Card";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Chip } from "@connected-repo/ui-mui/data-display/Chip";
import type { journalEntrySelectAllZod } from "@connected-repo/zod-schemas/journal_entry.zod";
import type { z } from "zod";

type JournalEntry = z.infer<typeof journalEntrySelectAllZod>;

interface JournalEntryCardViewProps {
	entries: JournalEntry[];
	onEntryClick: (entryId: string) => void;
}

export function JournalEntryCardView({ entries, onEntryClick }: JournalEntryCardViewProps) {
	const truncateContent = (content: string, maxLength = 100) => {
		if (content.length <= maxLength) return content;
		return `${content.substring(0, maxLength)}...`;
	};

	const formatDate = (date: number | string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: {
					xs: "1fr",
					sm: "repeat(2, 1fr)",
					lg: "repeat(3, 1fr)",
				},
				gap: { xs: 2, sm: 2.5, lg: 3 },
				width: "100%",
				maxWidth: "100%",
				overflow: "hidden",
			}}
		>
			{entries.map((entry) => (
				<Box
					key={entry.journalEntryId}
					sx={{
						display: "flex",
						minHeight: 0,
						minWidth: 0,
					}}
				>
					<Card
						onClick={() => onEntryClick(entry.journalEntryId)}
						sx={{
							height: "100%",
							width: "100%",
							display: "flex",
							flexDirection: "column",
							cursor: "pointer",
							border: "1px solid",
							borderColor: "divider",
							transition: "all 0.25s ease-in-out",
							"&:hover": {
								transform: "translateY(-6px)",
								boxShadow: 6,
								borderColor: "primary.main",
							},
						}}
					>
						<CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: { xs: 2, sm: 2.5, lg: 3 } }}>
							{/* Prompt Section */}
							<Box sx={{ mb: 2 }}>
								<Chip
									label={entry.prompt || "Journal Entry"}
									color="primary"
									size="small"
									sx={{
										fontWeight: 600,
										fontSize: "0.75rem",
										mb: 1.5,
									}}
								/>
							</Box>

							{/* Content Preview */}
							<Typography
								variant="body1"
								color="text.primary"
								sx={{
									flexGrow: 1,
									mb: 2,
									lineHeight: 1.7,
									overflow: "hidden",
									display: "-webkit-box",
									WebkitLineClamp: 4,
									WebkitBoxOrient: "vertical",
								}}
							>
								{truncateContent(entry.content)}
							</Typography>

							{/* Date Footer */}
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									pt: 2,
									borderTop: "1px solid",
									borderColor: "divider",
								}}
							>
								<Typography variant="caption" color="text.secondary" fontWeight={500}>
									{formatDate(entry.createdAt)}
								</Typography>
								<Typography
									variant="caption"
									color="primary.main"
									fontWeight={600}
									sx={{
										textTransform: "uppercase",
										letterSpacing: "0.5px",
									}}
								>
									Read More →
								</Typography>
							</Box>
						</CardContent>
					</Card>
				</Box>
			))}
		</Box>
	);
}
