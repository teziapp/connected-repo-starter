import { DashboardIcon } from "@connected-repo/ui-mui/icons/DashboardIcon";
import { HomeIcon } from "@connected-repo/ui-mui/icons/HomeIcon";
import { ListIcon } from "@connected-repo/ui-mui/icons/ListIcon";
import { PostAddIcon } from "@connected-repo/ui-mui/icons/PostAddIcon";

export interface NavItem {
	/** Display label for the nav item */
	label: string;
	/** Route path */
	path: string;
	/** Icon for desktop navbar */
	desktopIcon: React.ReactNode;
	/** Icon for mobile navbar (optional, defaults to desktopIcon) */
	mobileIcon?: React.ReactNode;
}

/**
 * Main navigation items for the application
 * Used by both DesktopNavbar and MobileNavbar
 */
export const navItems: NavItem[] = [
	{
		label: "Dashboard",
		path: "/dashboard",
		desktopIcon: <DashboardIcon fontSize="small" />,
		mobileIcon: <HomeIcon />, // Different icon for mobile
	},
	{
		label: "Posts",
		path: "/posts",
		desktopIcon: <ListIcon fontSize="small" />,
		mobileIcon: <ListIcon />,
	},
	{
		label: "Create Post",
		path: "/posts/new",
		desktopIcon: <PostAddIcon fontSize="small" />,
		mobileIcon: <PostAddIcon />,
	},
];

/**
 * Get icon for navbar based on platform
 */
export const getNavIcon = (item: NavItem, isMobile: boolean) => {
	return isMobile && item.mobileIcon ? item.mobileIcon : item.desktopIcon;
};
