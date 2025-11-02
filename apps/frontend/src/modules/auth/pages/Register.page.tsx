import { Avatar } from "@connected-repo/ui-mui/data-display/Avatar";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Alert } from "@connected-repo/ui-mui/feedback/Alert";
import { CircularProgress } from "@connected-repo/ui-mui/feedback/CircularProgress";
import { Fade } from "@connected-repo/ui-mui/feedback/Fade";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { TextField } from "@connected-repo/ui-mui/form/TextField";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { userCreateInputZod } from "@connected-repo/zod-schemas/user.zod";
import { trpc } from "@frontend/utils/trpc.client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import type { z } from "zod";

type RegisterFormData = z.infer<typeof userCreateInputZod>;

const RegisterPage = () => {
	const navigate = useNavigate();

	// Fetch session info to pre-fill form
	const { data: sessionInfo, isLoading: isLoadingSession } = useSuspenseQuery(trpc.auth.getSessionInfo.queryOptions());

	// Register mutation
	const registerMutation = useMutation(trpc.users.create.mutationOptions({
		onSuccess: () => {
			navigate("/dashboard");
		},
	}));

	// Form setup with Zod validation
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(userCreateInputZod),
	});

	// Pre-fill form with session data
	useEffect(() => {
		if (sessionInfo?.user) {
			setValue("email", sessionInfo.user.email);
			setValue("name", sessionInfo.user.name || "");
			setValue("displayPicture", sessionInfo.user.displayPicture || null);
		}
	}, [sessionInfo, setValue]);

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

	const onSubmit = async (data: RegisterFormData) => {
		await registerMutation.mutateAsync(data);
	};

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
							<Box
								component="form"
								onSubmit={handleSubmit(onSubmit)}
								sx={{ width: "100%" }}
							>
								<Stack spacing={3}>
									{/* Hidden displayPicture field */}
									<input type="hidden" {...register("displayPicture")} />

									{/* Email Field (pre-filled, readonly) */}
									<TextField
										label="Email Address"
										type="email"
										{...register("email")}
										error={!!errors.email}
										helperText={errors.email?.message || "From your Google account"}
										fullWidth
										InputProps={{
											readOnly: true,
										}}
										sx={{
											"& .MuiOutlinedInput-root": {
												bgcolor: "action.hover",
											},
										}}
									/>

									{/* Name Field (pre-filled, editable) */}
									<TextField
										label="Full Name"
										{...register("name")}
										error={!!errors.name}
										helperText={errors.name?.message || "You can edit this if needed"}
										fullWidth
										autoFocus
										sx={{
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

									{/* Error Alert */}
									{registerMutation.error && (
										<Fade in>
											<Alert severity="error">
												{registerMutation.error.message || "Failed to register. Please try again."}
											</Alert>
										</Fade>
									)}

									{/* Submit Button */}
									<Button
										type="submit"
										variant="contained"
										size="large"
										fullWidth
										disabled={isSubmitting || registerMutation.isPending}
										sx={{
											py: 1.5,
											fontSize: "1.1rem",
											fontWeight: 600,
											textTransform: "none",
											borderRadius: 2,
											boxShadow: 2,
											transition: "all 0.2s ease-in-out",
											"&:hover": {
												transform: "translateY(-2px)",
												boxShadow: 4,
											},
											"&:active": {
												transform: "translateY(0)",
											},
										}}
									>
										{isSubmitting || registerMutation.isPending ? (
											<>
												<CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
												Creating account...
											</>
										) : (
											"Complete Registration"
										)}
									</Button>
								</Stack>
							</Box>

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