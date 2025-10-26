import type { CardProps } from "@mui/material/Card";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import type { ReactNode } from "react";

export interface ContentCardProps extends CardProps {
	children: ReactNode;
}

export const ContentCard = ({ children, sx, ...props }: ContentCardProps) => {
	return (
		<Card
			sx={{
				p: 2.5,
				mb: 2.5,
				border: "1px solid",
				borderColor: "divider",
				...sx
			}}
			{...props}
		>
			<CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
				{children}
			</CardContent>
		</Card>
	);
}
