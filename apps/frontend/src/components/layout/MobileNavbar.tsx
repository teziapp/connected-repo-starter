import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { AppBar } from "@connected-repo/ui-mui/navigation/AppBar";
import { BottomNavigation } from "@connected-repo/ui-mui/navigation/BottomNavigation";
import { BottomNavigationAction } from "@connected-repo/ui-mui/navigation/BottomNavigationAction";
import { Toolbar } from "@connected-repo/ui-mui/navigation/Toolbar";
import { navItems } from "@frontend/config/nav.config";
import { useLocation, useNavigate } from "react-router";
import { UserProfileMenu } from "./UserProfileMenu";

export const MobileNavbar = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// Map paths to bottom nav indices
	const getBottomNavValue = () => {
		// Check navigation items first
		const navIndex = navItems.findIndex(item => item.path === location.pathname);
		if (navIndex !== -1) return navIndex;

		// Profile is the last item
		if (location.pathname === "/profile") return navItems.length;

		return 0; // Default to first nav item (Dashboard)
	};

	const handleBottomNavChange = (_event: React.SyntheticEvent, newValue: number) => {
		// If profile is clicked (last item), navigate to profile
		if (newValue === navItems.length) {
			navigate("/profile");
			return;
		}

		// Navigate to the selected nav item
		const item = navItems[newValue];
		if (item) {
			navigate(item.path);
		}
	};

	return (
		<>
			{/* Top AppBar */}
			<AppBar
				position="sticky"
				elevation={0}
				sx={{
					bgcolor: "background.paper",
					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<Toolbar
					sx={{
						minHeight: 56,
						px: 2,
						justifyContent: "space-between",
					}}
				>
					{/* Logo */}
					<Box
						onClick={() => navigate("/dashboard")}
						sx={{
							display: "flex",
							alignItems: "center",
							cursor: "pointer",
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

					{/* User Avatar - triggers menu */}
					<UserProfileMenu />
				</Toolbar>
			</AppBar>

			{/* Bottom Navigation */}
			<Paper
				sx={{
					position: "fixed",
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 1000,
					borderTop: "1px solid",
					borderColor: "divider",
				}}
				elevation={3}
			>
				<BottomNavigation
					value={getBottomNavValue()}
					onChange={handleBottomNavChange}
					showLabels
					sx={{
						height: 64,
						"& .MuiBottomNavigationAction-root": {
							minWidth: 60,
							px: 0,
							transition: "all 0.2s ease-in-out",
							"&.Mui-selected": {
								color: "primary.main",
								"& .MuiSvgIcon-root": {
									transform: "scale(1.1)",
								},
							},
							"&:active": {
								transform: "scale(0.95)",
							},
						},
					}}
				>
					{/* Navigation items from config */}
					{navItems.map((item) => (
						<BottomNavigationAction
							key={item.path}
							label={item.label}
							icon={item.mobileIcon || item.desktopIcon}
							sx={{
								"&:hover": {
									bgcolor: "action.hover",
								},
							}}
						/>
					))}
				</BottomNavigation>
			</Paper>
		</>
	);
};
