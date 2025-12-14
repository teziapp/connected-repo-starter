import { Avatar } from "@connected-repo/ui-mui/data-display/Avatar";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { MenuItem } from "@connected-repo/ui-mui/form/MenuItem";
import { DarkModeIcon } from "@connected-repo/ui-mui/icons/DarkModeIcon";
import { DashboardIcon } from "@connected-repo/ui-mui/icons/DashboardIcon";
import { LightModeIcon } from "@connected-repo/ui-mui/icons/LightModeIcon";
import { LogoutIcon } from "@connected-repo/ui-mui/icons/LogoutIcon";
import { SettingsIcon } from "@connected-repo/ui-mui/icons/SettingsIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Divider } from "@connected-repo/ui-mui/layout/Divider";
import { IconButton } from "@connected-repo/ui-mui/navigation/IconButton";
import { Menu } from "@connected-repo/ui-mui/navigation/Menu";
import { useThemeMode } from "@connected-repo/ui-mui/theme/ThemeContext";
import type { SessionInfo } from "@frontend/contexts/UserContext";
import { authClient } from "@frontend/utils/auth.client";
import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";

interface UserProfileMenuProps {
	/** Optional custom trigger button. If not provided, uses default avatar */
	trigger?: React.ReactNode;
	/** Whether to show user info in menu header */
	showUserInfo?: boolean;
}

export const UserProfileMenu = ({
	trigger,
	showUserInfo = true,
}: UserProfileMenuProps) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const navigate = useNavigate();
	const open = Boolean(anchorEl);

	// Get session info from prop or loader data
	const sessionInfo = useLoaderData() as SessionInfo | undefined;

	const user = sessionInfo?.user;

	// Theme toggle
	const { mode, toggleTheme } = useThemeMode();
	const isDarkMode = mode === "dark";

	const handleLogout = () => {
		handleClose();
		authClient.signOut()
			.then(() => {
				// Redirect to login after successful logout
				navigate("/auth/login");
			})
			.catch((error) => {
				console.error("Logout failed:", error);
				// Still redirect to login even if mutation fails
				navigate("/auth/login");
			});
	};

	const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleNavigation = (path: string) => {
		handleClose();
		navigate(path);
	};

	const handleThemeToggle = () => {
		toggleTheme();
		handleClose();
	};

	// Default avatar button trigger
	const defaultTrigger = (
		<IconButton
			onClick={handleOpen}
			size="small"
			sx={{
				transition: "transform 0.2s ease-in-out",
				"&:hover": {
					transform: "scale(1.05)",
				},
			}}
			aria-label="User menu"
		>
			<Avatar
				src={user?.image || undefined}
				alt={user?.name || user?.email || "User"}
				sx={{
					width: 40,
					height: 40,
					border: "2px solid",
					borderColor: open ? "primary.main" : "divider",
					transition: "all 0.2s ease-in-out",
				}}
			>
				{!user?.image && (user?.name?.[0] || user?.email?.[0] || "U")}
			</Avatar>
		</IconButton>
	);

	return (
		<>
			{trigger || defaultTrigger}

			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				onClick={handleClose}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				slotProps={{
					paper: {
						elevation: 3,
						sx: {
							mt: 1.5,
							minWidth: 220,
							borderRadius: 2,
							overflow: "visible",
							border: "1px solid",
							borderColor: "divider",
							"&:before": {
								content: '""',
								display: "block",
								position: "absolute",
								top: 0,
								right: 14,
								width: 10,
								height: 10,
								bgcolor: "background.paper",
								transform: "translateY(-50%) rotate(45deg)",
								zIndex: 0,
								borderLeft: "1px solid",
								borderTop: "1px solid",
								borderColor: "divider",
							},
						},
					},
				}}
			>
				{/* User Info Header */}
				{showUserInfo && user && (
					<Box sx={{ px: 2, py: 1.5 }}>
						<Typography
							variant="subtitle2"
							fontWeight={600}
							color="text.primary"
							noWrap
						>
							{user.name || "User"}
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
							noWrap
							sx={{ display: "block" }}
						>
							{user.email}
						</Typography>
					</Box>
				)}
				{showUserInfo && user && <Divider />}

				{/* Dashboard */}
				<MenuItem
					onClick={() => handleNavigation("/dashboard")}
					sx={{
						py: 1.5,
						gap: 1.5,
						transition: "all 0.15s ease-in-out",
						"&:hover": {
							bgcolor: "action.hover",
							transform: "translateX(4px)",
						},
					}}
				>
					<DashboardIcon fontSize="small" />
					<Typography variant="body2">Dashboard</Typography>
				</MenuItem>

				{/* Profile/Settings */}
				<MenuItem
					onClick={() => handleNavigation("/profile")}
					sx={{
						py: 1.5,
						gap: 1.5,
						transition: "all 0.15s ease-in-out",
						"&:hover": {
							bgcolor: "action.hover",
							transform: "translateX(4px)",
						},
					}}
				>
					<SettingsIcon fontSize="small" />
					<Typography variant="body2">Profile & Settings</Typography>
				</MenuItem>

				<Divider />

				{/* Theme Toggle */}
				<MenuItem
					onClick={handleThemeToggle}
					sx={{
						py: 1.5,
						gap: 1.5,
						transition: "all 0.15s ease-in-out",
						"&:hover": {
							bgcolor: "action.hover",
							transform: "translateX(4px)",
						},
					}}
				>
					{isDarkMode ? (
						<LightModeIcon fontSize="small" />
					) : (
						<DarkModeIcon fontSize="small" />
					)}
					<Typography variant="body2">
						{isDarkMode ? "Light Mode" : "Dark Mode"}
					</Typography>
				</MenuItem>

				<Divider />

				{/* Logout */}
				<MenuItem
					onClick={handleLogout}
					sx={{
						py: 1.5,
						gap: 1.5,
						color: "error.main",
						transition: "all 0.15s ease-in-out",
						"&:hover": {
							bgcolor: "error.lighter",
							transform: "translateX(4px)",
						},
					}}
				>
					<LogoutIcon fontSize="small" />
					<Typography variant="body2">Logout</Typography>
				</MenuItem>
			</Menu>
		</>
	);
};
