import { Avatar } from "@connected-repo/ui-mui/data-display/Avatar";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { CircularProgress } from "@connected-repo/ui-mui/feedback/CircularProgress";
import { Fade } from "@connected-repo/ui-mui/feedback/Fade";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { RhfSubmitButton } from "@connected-repo/ui-mui/rhf-form/RhfSubmitButton";
import { RhfTextField } from "@connected-repo/ui-mui/rhf-form/RhfTextField";
import { useRhfForm } from "@connected-repo/ui-mui/rhf-form/useRhfForm";
import { UserCreateInput, userCreateInputZod } from "@connected-repo/zod-schemas/user.zod";
import { trpc, trpcFetch } from "@frontend/utils/trpc.client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";

type RegisterFormData = UserCreateInput;

const RegisterPage = () => {
	const navigate = useNavigate();

	// Fetch session info to pre-fill form
	const { data: sessionInfo, isLoading: isLoadingSession } = useSuspenseQuery(trpc.auth.getSessionInfo.queryOptions());

	// Form setup with Zod validation and RHF
	const { formMethods, RhfFormProvider } = useRhfForm<RegisterFormData>({
		onSubmit: async (data) => {
			await trpcFetch.users.create.mutate(data);
			navigate("/dashboard");
		},
		formConfig: {
			resolver: zodResolver(userCreateInputZod),
		},
	});

	// Pre-fill form with session data
	useEffect(() => {
		if (sessionInfo?.user) {
			formMethods.setValue("email", sessionInfo.user.email);
			formMethods.setValue("name", sessionInfo.user.name || "");
			formMethods.setValue("displayPicture", sessionInfo.user.displayPicture || null);
		}
	}, [sessionInfo, formMethods]);

	// Redirect if already registered
	useEffect(() => {
		if (sessionInfo?.isRegistered) {
			navigate("/dashboard");
		}
	}, [sessionInfo, navigate]);

	// Redirect if no session
	useEffect(() => {
		if (sessionInfo && !sessionInfo.hasSession) {
			navigate("/auth/login");
		}
	}, [sessionInfo, navigate]);

	if (isLoadingSession) {
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

	return (
		<Box
			sx={{
				minHeight: "100vh",
				bgcolor: "background.default",
				py: { xs: 4, md: 8 },
			}}
		>
			<Container maxWidth="sm">
				<Fade in timeout={400}>
					<Card
						sx={{
							p: { xs: 3, md: 4 },
							borderRadius: 2,
							boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<Stack spacing={3} alignItems="center">
							{/* Profile Picture */}
							{sessionInfo?.user?.displayPicture && (
								<Avatar
									src={sessionInfo.user.displayPicture}
									alt={sessionInfo.user.name || undefined}
									sx={{
										width: 80,
										height: 80,
										border: "4px solid",
										borderColor: "primary.main",
										boxShadow: 2,
									}}
								/>
							)}

							{/* Header */}
							<Box textAlign="center">
								<Typography variant="h4" fontWeight={600} gutterBottom>
									Complete Your Registration
								</Typography>
								<Typography variant="body1" color="text.secondary">
									Just a few more details to get started
								</Typography>
							</Box>

							{/* Form */}
							<RhfFormProvider>
								<Stack spacing={3} sx={{ width: "100%" }}>
									{/* Hidden displayPicture field */}
									<input type="hidden" {...formMethods.register("displayPicture")} />

									{/* Email Field (pre-filled, readonly) */}
									<RhfTextField
										name="email"
										label="Email Address"
										type="email"
										helperText="From your Google account"
										InputProps={{
											readOnly: true,
										}}
										sx={{
											mb: 0,
											"& .MuiOutlinedInput-root": {
												bgcolor: "action.hover",
											},
										}}
									/>

									{/* Name Field (pre-filled, editable) */}
									<RhfTextField
										name="name"
										label="Full Name"
										helperText="You can edit this if needed"
										autoFocus
										sx={{
											mb: 0,
											"& .MuiOutlinedInput-root": {
												"&.Mui-focused": {
													"& fieldset": {
														borderWidth: 2,
														borderColor: "primary.main",
													},
												},
											},
										}}
									/>

									{/* Submit Button */}
									<RhfSubmitButton
										notSubmittingText="Complete Registration"
										isSubmittingText="Creating account..."
										props={{
											size: "large",
										}}
									/>
								</Stack>
							</RhfFormProvider>

							{/* Terms */}
							<Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
								By registering, you agree to our Terms of Service and Privacy Policy
							</Typography>
						</Stack>
					</Card>
				</Fade>
			</Container>
		</Box>
	);
};

export default RegisterPage;
