import { baseOrpc } from '@backend/procedures/public.procedure';
import * as z from 'zod';

const googleAuthStart = baseOrpc.handler(async () => {
	// For now, return a placeholder - better-auth handles OAuth through built-in endpoints
	// This would typically redirect to better-auth's OAuth endpoint
	return {
		redirectUrl: `${process.env.VITE_API_URL}/api/auth/sign-in/google?callbackURL=${encodeURIComponent(`${process.env.VITE_API_URL}/api/auth/callback/google`)}`
	};
});

const googleAuthCallback = baseOrpc
	.input(z.object({ code: z.string() }))
	.handler(async () => {
		// For now, return a placeholder - better-auth handles OAuth callback through built-in endpoints
		// This would typically be handled by better-auth's callback endpoint
		return {
			success: true,
			message: "OAuth callback handled by better-auth built-in endpoint"
		};
	});

export const oauthRouter = {
	google: {
		start: googleAuthStart,
		callback: googleAuthCallback,
	},
};