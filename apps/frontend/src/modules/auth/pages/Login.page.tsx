import { GoogleIcon } from "@connected-repo/ui-mui/components/GoogleIcon";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Alert } from "@connected-repo/ui-mui/feedback/Alert";
import { Fade } from "@connected-repo/ui-mui/feedback/Fade";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { authClient } from "@frontend/utils/auth.client";
import { useState } from "react";
import { useSearchParams } from "react-router";

export const LoginPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [showContent] = useState(true);
	const [searchParams] = useSearchParams();
	const error = searchParams.get("error");

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      const data = await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.origin,
      }, {
				throw: true,
			});
      console.log('OAuth initiation response:', data);

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('OAuth initiation failed:', error);
      setIsLoading(false);
    }
  };

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				px: { xs: 2, sm: 3 },
				py: { xs: 3, sm: 4 },
			}}
		>
			<Container maxWidth="sm">
				<Fade in={showContent} timeout={600}>
					<Paper
							elevation={0}
							sx={{
								p: { xs: 4, sm: 5, md: 6 },
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
								bgcolor: "background.paper",
								transition: "all 0.3s ease-in-out",
								"&:hover": {
									boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
								},
							}}
						>
							<Stack spacing={4} alignItems="center">
								{/* Header Section */}
								<Box sx={{ textAlign: "center" }}>
									<Typography
										variant="h3"
										sx={{
											fontWeight: 600,
											color: "text.primary",
											mb: 2,
											fontSize: { xs: "2rem", sm: "2.5rem", md: "2.75rem" },
											letterSpacing: "-1px",
										}}
									>
										Welcome
									</Typography>
									<Typography
										variant="h6"
										sx={{
											color: "text.secondary",
											lineHeight: 1.7,
											fontWeight: 400,
											mb: 1,
											fontSize: { xs: "1.1rem", sm: "1.25rem" },
										}}
									>
										Scheduled Prompt & Journal
									</Typography>
									<Typography
										variant="body1"
										sx={{
											color: "text.secondary",
											lineHeight: 1.8,
											fontSize: { xs: "0.95rem", sm: "1rem" },
											maxWidth: 400,
											mx: "auto",
										}}
									>
										A simple way to journal and reflect on your day with timely, thought-provoking prompts
									</Typography>
								</Box>

								{/* Error Alert */}
								{error && (
									<Fade in>
										<Alert
											severity="error"
											sx={{
												width: "100%",
												maxWidth: 400,
												borderRadius: 2,
											}}
										>
											{error === "oauth_failed"
												? "Authentication failed. Please try again."
												: "An error occurred during login. Please try again."}
										</Alert>
									</Fade>
								)}

								{/* Google Sign In Button */}
								<Box sx={{ width: "100%", maxWidth: 360 }}>
									<Button
										variant="outlined"
										fullWidth
										onClick={handleGoogleLogin}
										disabled={isLoading}
										sx={{
											py: { xs: 1.75, sm: 1.5 },
											px: 3,
											fontSize: { xs: "1rem", sm: "0.95rem" },
											fontWeight: 600,
											textTransform: "none",
											borderRadius: 2,
											borderWidth: 2,
											borderColor: "divider",
											color: "text.primary",
											bgcolor: "background.paper",
											minHeight: { xs: 56, sm: 52 },
											transition: "all 0.25s ease-in-out",
											boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
											"&:hover": {
												borderWidth: 2,
												borderColor: "primary.main",
												bgcolor: "primary.light",
												transform: "translateY(-2px)",
												boxShadow: "0 4px 16px rgba(102, 126, 234, 0.2)",
											},
											"&:active": {
												transform: "translateY(0)",
												boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
											},
											"&.Mui-disabled": {
												borderColor: "action.disabledBackground",
												bgcolor: "action.disabledBackground",
												color: "action.disabled",
											},
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												gap: 1.5,
											}}
										>
											<GoogleIcon width={20} height={20} />
											<span>{isLoading ? "Connecting..." : "Continue with Google"}</span>
										</Box>
									</Button>
								</Box>

								{/* Feature Highlights */}
								<Box sx={{ mt: 4, pt: 4, borderTop: "1px solid", borderColor: "divider", width: "100%" }}>
									<Stack spacing={2}>
										<FeatureItem icon="📝" text="Daily thought-provoking prompts" />
										<FeatureItem icon="⏰" text="Scheduled notifications at your chosen time" />
										<FeatureItem icon="🔍" text="Simple search to revisit past reflections" />
									</Stack>
								</Box>

								{/* Footer */}
								<Box sx={{ mt: 2 }}>
									<Typography
										variant="caption"
										sx={{
											color: "text.disabled",
											fontSize: { xs: "0.8rem", sm: "0.75rem" },
										}}
									>
										By continuing, you agree to our Terms of Service and Privacy Policy
									</Typography>
								</Box>
							</Stack>
					</Paper>
				</Fade>
			</Container>
		</Box>
	);
};

// Helper component for feature items
const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: 2,
			px: 1,
		}}
	>
		<Typography
			sx={{
				fontSize: { xs: "1.5rem", sm: "1.25rem" },
				lineHeight: 1,
			}}
		>
			{icon}
		</Typography>
		<Typography
			variant="body2"
			sx={{
				color: "text.secondary",
				fontSize: { xs: "0.95rem", sm: "0.9rem" },
				lineHeight: 1.6,
			}}
		>
			{text}
		</Typography>
	</Box>
);
