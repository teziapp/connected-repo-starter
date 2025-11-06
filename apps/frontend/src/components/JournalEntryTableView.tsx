import { Box } from "@connected-repo/ui-mui/layout/Box";
import type { journalEntrySelectAllZod } from "@connected-repo/zod-schemas/journal_entry.zod";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useMemo } from "react";
import type { z } from "zod";

type JournalEntry = z.infer<typeof journalEntrySelectAllZod>;

interface JournalEntryTableViewProps {
	entries: JournalEntry[];
	onEntryClick: (entryId: string) => void;
}

export function JournalEntryTableView({ entries, onEntryClick }: JournalEntryTableViewProps) {
	const truncateContent = (content: string, maxLength = 100) => {
		if (content.length <= maxLength) return content;
		return `${content.substring(0, maxLength)}...`;
	};

	const formatDate = (date: number | string | Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const columns = useMemo<MRT_ColumnDef<JournalEntry>[]>(
		() => [
			{
				accessorKey: "prompt",
				header: "Prompt",
				size: 200,
				// Cell: ({ cell }) => (
				// 	<Chip
				// 		label={cell.getValue<string>() || "Journal Entry"}
				// 		color="primary"
				// 		size="small"
				// 		sx={{ fontWeight: 600 }}
				// 	/>
				// ),
			},
			{
				accessorKey: "content",
				header: "Entry Preview",
				size: 400,
				Cell: ({ cell }) => (
					<Box
						sx={{
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{truncateContent(cell.getValue<string>())}
					</Box>
				),
			},
			{
				accessorKey: "createdAt",
				header: "Date",
				size: 180,
				Cell: ({ cell }) => formatDate(cell.getValue<number>()),
			},
		],
		[],
	);

	return (
		<MaterialReactTable
			columns={columns}
			data={entries}
			enableColumnActions={false}
			enableColumnFilters={false}
			enableSorting={true}
			enableDensityToggle={false}
			enableFullScreenToggle={false}
			enableHiding={false}
			initialState={{
				density: "comfortable",
				sorting: [{ id: "createdAt", desc: true }],
			}}
			muiTableBodyRowProps={({ row }) => ({
				onClick: () => onEntryClick(row.original.journalEntryId),
				sx: {
					cursor: "pointer",
					transition: "background-color 0.2s ease-in-out",
					"&:hover": {
						backgroundColor: "action.hover",
					},
				},
			})}
			muiTablePaperProps={{
				sx: {
					border: "1px solid",
					borderColor: "divider",
					boxShadow: "none",
				},
			}}
		/>
	);
}
