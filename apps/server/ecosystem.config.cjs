module.exports = {
	apps: [
		{
			name: "tezi-fast",
			script: "dist/src/server.js",
			instances: "max",
			watch: false,
			exec_mode: "cluster",
			autorestart: true,
			max_memory_restart: "1024M", // Slightly reduced to prevent OOM
			max_restarts: 15, // Increased for better resilience

			// Logging configuration
			error_file: "logs/err.log",
			out_file: "logs/out.log",
			log_date_format: "YYYY-MM-DD HH:mm:ss Z", // Z is timezone of india
			log_type: "json",
			max_logs: "10d",
			merge_logs: true,

			// Instance configuration
			instance_var: "INSTANCE_ID",
			listen_timeout: 10000, // Increased for SSL handshake
			kill_timeout: 5000, // Increased for graceful shutdown

			// Monitoring and restart behavior
			deep_monitoring: false, // Disabled due to performance concerns

			// HTTP/2 specific optimizations
			wait_ready: true, // Wait for ready signal
			shutdown_with_message: true, // Graceful shutdown

			// Metrics collection
			metrics: {
				http: true, // Collects HTTP metrics, including request and response data, allowing you to track HTTP performance.
				runtime: true, // Collects runtime metrics, such as CPU and memory usage, to help you monitor the application's resource consumption.
				transaction: true, // Collects transaction metrics, including response times and error rates, to provide detailed insights into the application's performance and reliability.
			},

			// Health check
			status_interval: 30000, // Status check interval

			// Resource management
			increment_var: "PORT",
			restart_delay: 1000, // Adds a 1-second delay before PM2 restarts an application after a failure, allowing some buffer time to resolve issues.
			min_uptime: 10000, // Ensures the application runs for at least 10 seconds before PM2 considers it stable. If the app crashes before this time, it's treated as an error.

			max_restarts_per_min: 10, // Sets a limit of 10 restarts per minute to prevent infinite restart loops, especially if the app faces recurring issues.

			// Source map support for better error tracking
			source_map_support: true,
		},
	],
};
