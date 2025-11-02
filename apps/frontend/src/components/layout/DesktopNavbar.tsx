import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { AppBar } from "@connected-repo/ui-mui/navigation/AppBar";
import { Toolbar } from "@connected-repo/ui-mui/navigation/Toolbar";
import { navItems } from "@frontend/config/nav.config";
import { useLocation, useNavigate } from "react-router";
import { UserProfileMenu } from "./UserProfileMenu";

/**
 * DesktopNavbar - Top navigation bar for desktop layout
 *
 * Features:
 * - App logo/brand
 * - Navigation links (Dashboard, Posts, Create Post)
 * - User profile menu on right
 * - Sticky position
 */
export const DesktopNavbar = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const isActive = (path: string) => location.pathname === path;

	return (
		<AppBar
			position="sticky"
			elevation={0}
			sx={{
				bgcolor: "background.paper",
				borderBottom: "1px solid",
				borderColor: "divider",
			}}
		>
			<Toolbar sx={{ gap: 2 }}>
				{/* Logo/Brand */}
				<Box
					onClick={() => navigate("/dashboard")}
					sx={{
						display: "flex",
						alignItems: "center",
						cursor: "pointer",
						mr: 4,
						transition: "transform 0.2s ease-in-out",
						"&:hover": {
							transform: "scale(1.02)",
						},
					}}
				>
					<Typography
						variant="h6"
						component="div"
						sx={{
							fontWeight: 700,
							color: "primary.main",
							letterSpacing: -0.5,
						}}
					>
						OneQ
					</Typography>
				</Box>

				{/* Navigation Links */}
				<Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
					{navItems.map((item) => (
						<Button
							key={item.path}
							onClick={() => navigate(item.path)}
							startIcon={item.desktopIcon}
							sx={{
								px: 2,
								py: 1,
								borderRadius: 2,
								color: isActive(item.path)
									? "primary.main"
									: "text.secondary",
								bgcolor: isActive(item.path)
									? "primary.lighter"
									: "transparent",
								fontWeight: isActive(item.path) ? 600 : 500,
								transition: "all 0.2s ease-in-out",
								"&:hover": {
									bgcolor: isActive(item.path)
										? "primary.light"
										: "action.hover",
									transform: "translateY(-2px)",
								},
								"&:active": {
									transform: "translateY(0)",
								},
							}}
						>
							{item.label}
						</Button>
					))}
				</Box>

				{/* User Profile Menu */}
				<UserProfileMenu />
			</Toolbar>
		</AppBar>
	);
};
