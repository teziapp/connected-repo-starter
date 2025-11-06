import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { useNavigate } from "react-router";

export function JournalEntriesEmptyState() {
	const navigate = useNavigate();

	return (
		<Box
			sx={{
				textAlign: "center",
				py: 12,
				px: 3,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<Box
				sx={{
					width: { xs: 180, md: 240 },
					height: { xs: 180, md: 240 },
					mb: 4,
					borderRadius: "50%",
					bgcolor: "action.hover",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: { xs: "4rem", md: "6rem" },
					opacity: 0.6,
				}}
			>
				📔
			</Box>

			<Typography
				variant="h4"
				color="text.primary"
				gutterBottom
				fontWeight={600}
				sx={{ mb: 2 }}
			>
				No Journal Entries Yet
			</Typography>

			<Typography
				variant="body1"
				color="text.secondary"
				sx={{
					mb: 4,
					maxWidth: 500,
					lineHeight: 1.7,
				}}
			>
				Start your journaling journey today. Capture your thoughts, reflect on your experiences, and
				track your personal growth.
			</Typography>

			<Button
				variant="contained"
				size="large"
				onClick={() => navigate("/new-journal-entry")}
				sx={{
					px: 4,
					py: 1.5,
					fontSize: "1rem",
					fontWeight: 600,
					textTransform: "none",
					borderRadius: 2,
					transition: "all 0.2s ease-in-out",
					"&:hover": {
						transform: "translateY(-2px)",
						boxShadow: 4,
					},
				}}
			>
				Create Your First Entry
			</Button>
		</Box>
	);
}
