import { Avatar } from "@connected-repo/ui-mui/data-display/Avatar";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { AccountCircleIcon } from "@connected-repo/ui-mui/icons/AccountCircleIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { AppBar } from "@connected-repo/ui-mui/navigation/AppBar";
import { BottomNavigation } from "@connected-repo/ui-mui/navigation/BottomNavigation";
import { BottomNavigationAction } from "@connected-repo/ui-mui/navigation/BottomNavigationAction";
import { Toolbar } from "@connected-repo/ui-mui/navigation/Toolbar";
import { navItems } from "@frontend/config/nav.config";
import type { SessionInfo } from "@frontend/contexts/UserContext";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { UserProfileMenu } from "./UserProfileMenu";

interface MobileNavbarProps {
	sessionInfo: SessionInfo;
}

/**
 * MobileNavbar - Mobile navigation with top bar + bottom navigation
 *
 * Features:
 * - Minimal top bar with logo and user avatar
 * - Bottom navigation with 4 main items:
 *   - Dashboard (Home)
 *   - Posts (List)
 *   - Create Post (Add)
 *   - Profile (User avatar triggers menu)
 * - Fixed position for easy thumb access
 */
export const MobileNavbar = ({ sessionInfo }: MobileNavbarProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

	// Get user from session info
	const user = sessionInfo?.user;

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
							TezApp
						</Typography>
					</Box>

					{/* User Avatar - triggers menu */}
					<UserProfileMenu showUserInfo sessionInfo={sessionInfo} />
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

					{/* Profile item */}
					<BottomNavigationAction
						label="Profile"
						icon={
							user?.displayPicture ? (
								<Avatar
									src={user.displayPicture}
									alt={user.name || user.email || "User"}
									sx={{
										width: 24,
										height: 24,
									}}
								>
									{!user.displayPicture && (user?.name?.[0] || user?.email?.[0] || "U")}
								</Avatar>
							) : (
								<AccountCircleIcon />
							)
						}
						sx={{
							"&:hover": {
								bgcolor: "action.hover",
							},
						}}
					/>
				</BottomNavigation>
			</Paper>
		</>
	);
};
