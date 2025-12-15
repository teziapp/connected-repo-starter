import { isDev } from '@backend/configs/env.config';
import pino from 'pino';
import pretty from 'pino-pretty';

// Create pretty stream for development
export const logger = isDev
	? pino(
			pretty({
				colorize: true,
				translateTime: "HH:MM:ss",
				ignore: "pid,hostname",
				singleLine: true,
				messageFormat: "{msg} {if req.method}[{req.method} {req.url}]{end} {if rpc.method}[{rpc.method}]{end} {if res.status}→ {res.status}{end}",
			}),
		)
	: pino();