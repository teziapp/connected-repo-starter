import { Avatar } from "@connected-repo/ui-mui/data-display/Avatar";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Alert } from "@connected-repo/ui-mui/feedback/Alert";
import { CircularProgress } from "@connected-repo/ui-mui/feedback/CircularProgress";
import { Fade } from "@connected-repo/ui-mui/feedback/Fade";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { trpc } from "@frontend/utils/trpc.client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const DashboardPage = () => {
	const navigate = useNavigate();

	// Fetch session info to verify authentication
	const { data: sessionInfo, isLoading } = useQuery(trpc.auth.getSessionInfo.queryOptions());

	// Redirect if not authenticated or not registered
	useEffect(() => {
		if (sessionInfo) {
			if (!sessionInfo.hasSession) {
				navigate("/auth/login");
			} else if (!sessionInfo.isRegistered) {
				navigate("/auth/register");
			}
		}
	}, [sessionInfo, navigate]);

	if (isLoading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (!sessionInfo?.hasSession || !sessionInfo.isRegistered) {
		return null; // Will redirect via useEffect
	}

	return (
		<Box
			sx={{
				minHeight: "100vh",
				bgcolor: "background.default",
				py: { xs: 3, md: 4 },
			}}
		>
			<Container maxWidth="lg">
				<Fade in timeout={400}>
					<Stack spacing={4}>
						{/* Welcome Header */}
						<Card
							sx={{
								p: { xs: 3, md: 4 },
								background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
								color: "white",
								borderRadius: 2,
								boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
							}}
						>
							<Stack
								direction={{ xs: "column", sm: "row" }}
								spacing={3}
								alignItems={{ xs: "center", sm: "flex-start" }}
							>
								{sessionInfo.user?.picture && (
									<Avatar
										src={sessionInfo.user.picture}
										alt={sessionInfo.user.name || undefined}
										sx={{
											width: 80,
											height: 80,
											border: "4px solid rgba(255,255,255,0.3)",
											boxShadow: 3,
										}}
									/>
								)}
								<Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
									<Typography variant="h4" fontWeight={600} gutterBottom>
										Welcome back, {sessionInfo.user?.name || "User"}!
									</Typography>
									<Typography variant="body1" sx={{ opacity: 0.9 }}>
										{sessionInfo.user?.email}
									</Typography>
								</Box>
							</Stack>
						</Card>

						{/* Success Message */}
						<Fade in timeout={600}>
							<Alert
								severity="success"
								sx={{
									borderRadius: 2,
									boxShadow: 1,
								}}
							>
								<Typography variant="body1" fontWeight={500}>
									Your account is now active!
								</Typography>
								<Typography variant="body2" color="text.secondary">
									You can now access all features of the application.
								</Typography>
							</Alert>
						</Fade>

						{/* Quick Actions */}
						<Stack spacing={2}>
							<Typography variant="h5" fontWeight={600}>
								Quick Actions
							</Typography>
							<Stack
								direction={{ xs: "column", md: "row" }}
								spacing={2}
							>
								<Card
									sx={{
										p: 3,
										flex: 1,
										cursor: "pointer",
										transition: "all 0.2s ease-in-out",
										border: "1px solid",
										borderColor: "divider",
										"&:hover": {
											borderColor: "primary.main",
											transform: "translateY(-4px)",
											boxShadow: 4,
										},
									}}
								>
									<Typography variant="h6" gutterBottom fontWeight={600}>
										View Profile
									</Typography>
									<Typography variant="body2" color="text.secondary" mb={2}>
										Manage your account settings and preferences
									</Typography>
									<Button variant="outlined" size="small">
										Go to Profile
									</Button>
								</Card>

								<Card
									sx={{
										p: 3,
										flex: 1,
										cursor: "pointer",
										transition: "all 0.2s ease-in-out",
										border: "1px solid",
										borderColor: "divider",
										"&:hover": {
											borderColor: "primary.main",
											transform: "translateY(-4px)",
											boxShadow: 4,
										},
									}}
								>
									<Typography variant="h6" gutterBottom fontWeight={600}>
										Explore Features
									</Typography>
									<Typography variant="body2" color="text.secondary" mb={2}>
										Discover what you can do with your account
									</Typography>
									<Button variant="outlined" size="small">
										Get Started
									</Button>
								</Card>
							</Stack>
						</Stack>
					</Stack>
				</Fade>
			</Container>
		</Box>
	);
};

export default DashboardPage;