# Webhook Processor Cron Job Setup

This document explains how to setup automated webhook processing using cron jobs or job schedulers.

## Overview

The webhook processor handles sending queued webhooks with automatic retry logic and exponential backoff. It needs to run periodically to process pending webhooks.

**Recommended Frequency:** Every 1-5 minutes

## Prerequisites

1. **Environment Variable**: Set `INTERNAL_API_SECRET` in your `.env` file
   ```bash
   # Generate a secure secret (minimum 32 characters)
   openssl rand -base64 32

   # Add to .env
   INTERNAL_API_SECRET=your-generated-secret-here
   ```

2. **Server Running**: Ensure your backend server is running and accessible

## Setup Options

### Option 1: System Cron (Linux/macOS)

**Step 1:** Create a cron script

```bash
# Create script file
sudo nano /usr/local/bin/process-webhooks.sh
```

**Step 2:** Add the following content:

```bash
#!/bin/bash

# Configuration
API_URL="http://localhost:3000/internal/process-webhooks"
INTERNAL_SECRET="your-internal-secret-here"  # Replace with actual secret

# Make POST request with authentication
curl -X POST "$API_URL" \
  -H "Authorization: Bearer $INTERNAL_SECRET" \
  -H "Content-Type: application/json" \
  --silent \
  --show-error \
  --fail

# Check exit code
if [ $? -eq 0 ]; then
  echo "$(date): Webhook processing completed successfully"
else
  echo "$(date): Webhook processing failed" >&2
  exit 1
fi
```

**Step 3:** Make script executable:

```bash
sudo chmod +x /usr/local/bin/process-webhooks.sh
```

**Step 4:** Add to crontab:

```bash
# Edit crontab
crontab -e

# Add one of these lines (choose frequency):

# Every 1 minute
* * * * * /usr/local/bin/process-webhooks.sh >> /var/log/webhook-processor.log 2>&1

# Every 2 minutes
*/2 * * * * /usr/local/bin/process-webhooks.sh >> /var/log/webhook-processor.log 2>&1

# Every 5 minutes
*/5 * * * * /usr/local/bin/process-webhooks.sh >> /var/log/webhook-processor.log 2>&1
```

**Step 5:** Verify cron is set up:

```bash
crontab -l
```

**Step 6:** Monitor logs:

```bash
tail -f /var/log/webhook-processor.log
```

---

### Option 2: Node.js Script (Alternative)

If you prefer running webhook processor directly as a Node.js script:

**Step 1:** Create a runner script:

```bash
# Create script in project root
nano scripts/run-webhook-processor.js
```

**Step 2:** Add the following content:

```javascript
#!/usr/bin/env node

/**
 * Webhook Processor Runner Script
 *
 * This script can be run directly via Node.js or scheduled via cron.
 * It invokes the webhook processor endpoint with proper authentication.
 */

const axios = require('axios');
require('dotenv/config');

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

async function runWebhookProcessor() {
  if (!INTERNAL_SECRET) {
    console.error('ERROR: INTERNAL_API_SECRET not configured');
    process.exit(1);
  }

  try {
    const response = await axios.post(
      `${API_URL}/internal/process-webhooks`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${INTERNAL_SECRET}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log(`SUCCESS: Processed ${response.data.processed} webhooks`);
    console.log(`  - Succeeded: ${response.data.succeeded}`);
    console.log(`  - Failed: ${response.data.failed}`);
    console.log(`  - Retried: ${response.data.retried}`);

    process.exit(0);
  } catch (error) {
    if (error.response) {
      console.error(`ERROR: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      console.error('ERROR: No response from server - is the backend running?');
    } else {
      console.error(`ERROR: ${error.message}`);
    }

    process.exit(1);
  }
}

runWebhookProcessor();
```

**Step 3:** Make it executable and install dependencies:

```bash
chmod +x scripts/run-webhook-processor.js
npm install axios dotenv
```

**Step 4:** Test the script:

```bash
node scripts/run-webhook-processor.js
```

**Step 5:** Add to crontab:

```bash
crontab -e

# Add this line (adjust path to your project):
*/2 * * * * cd /path/to/your/project && node scripts/run-webhook-processor.js >> /var/log/webhook-processor.log 2>&1
```

---

### Option 3: PM2 (Process Manager)

If you're using PM2 to manage your backend, you can use PM2's cron feature:

**Step 1:** Create PM2 ecosystem file:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/src/backend.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'webhook-processor',
      script: 'scripts/run-webhook-processor.js',
      cron_restart: '*/2 * * * *', // Every 2 minutes
      autorestart: false, // Don't restart on completion
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

**Step 2:** Start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

### Option 4: Docker with Cron

If running in Docker, add cron to your container:

**Step 1:** Update Dockerfile:

```dockerfile
FROM node:22-alpine

# Install cron
RUN apk add --no-cache curl dcron

# Copy cron script
COPY scripts/process-webhooks.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/process-webhooks.sh

# Add crontab entry
RUN echo "*/2 * * * * /usr/local/bin/process-webhooks.sh >> /var/log/webhook-processor.log 2>&1" | crontab -

# Start cron in background and run your app
CMD crond && node dist/src/backend.js
```

---

### Option 5: Cloud Job Schedulers

#### AWS EventBridge (formerly CloudWatch Events)

1. Create a Lambda function that calls your webhook endpoint
2. Schedule it using EventBridge rules (cron expression)
3. Example cron: `rate(2 minutes)` or `cron(*/2 * * * ? *)`

#### Google Cloud Scheduler

```bash
gcloud scheduler jobs create http webhook-processor \
  --schedule="*/2 * * * *" \
  --uri="https://your-api.com/internal/process-webhooks" \
  --http-method=POST \
  --headers="Authorization=Bearer YOUR_SECRET"
```

#### Azure Logic Apps

1. Create a Logic App with Recurrence trigger
2. Add HTTP action to call your endpoint
3. Set interval to 2 minutes

---

## Monitoring & Troubleshooting

### Check Webhook Queue Status

Query your database to see pending webhooks:

```sql
SELECT status, COUNT(*)
FROM webhook_call_queues
GROUP BY status;
```

### View Failed Webhooks

```sql
SELECT *
FROM webhook_call_queues
WHERE status = 'Failed'
ORDER BY created_at DESC
LIMIT 10;
```

### Test Manual Trigger

```bash
curl -X POST http://localhost:3000/internal/process-webhooks \
  -H "Authorization: Bearer YOUR_INTERNAL_SECRET" \
  -H "Content-Type: application/json"
```

Expected response:

```json
{
  "success": true,
  "processed": 5,
  "succeeded": 4,
  "failed": 0,
  "retried": 1
}
```

### Common Issues

**Issue 1: 401 Unauthorized**
- Check `INTERNAL_API_SECRET` is set correctly in `.env`
- Verify Authorization header format: `Bearer <secret>`

**Issue 2: 503 Service Unavailable**
- `INTERNAL_API_SECRET` is not configured in environment
- Add it to your `.env` file

**Issue 3: Connection Refused**
- Backend server is not running
- Check firewall rules if running on remote server

**Issue 4: Webhooks Not Processing**
- Check cron is running: `ps aux | grep cron`
- Check crontab is set: `crontab -l`
- Check logs: `tail -f /var/log/webhook-processor.log`

---

## Security Best Practices

1. **Never commit** `INTERNAL_API_SECRET` to version control
2. **Rotate secrets** periodically (every 90 days)
3. **Use environment variables** or secret management (AWS Secrets Manager, Vault)
4. **Restrict network access** to internal endpoints (firewall rules)
5. **Monitor failed authentication** attempts in logs
6. **Use HTTPS** in production (never HTTP for authentication)

---

## Performance Tuning

### Adjust Processing Frequency

- **High volume**: Every 1 minute
- **Medium volume**: Every 2-3 minutes
- **Low volume**: Every 5 minutes

### Batch Size

The processor handles 50 webhooks per run by default. Adjust in `webhookQueue.utils.ts`:

```typescript
.limit(50); // Increase for higher throughput
```

### Concurrent Processing

For high throughput, consider running multiple processor instances:

```bash
# In crontab - run multiple instances with offset
* * * * * /usr/local/bin/process-webhooks.sh
* * * * * sleep 30 && /usr/local/bin/process-webhooks.sh
```

---

## Additional Resources

- [Crontab Guru](https://crontab.guru/) - Cron expression helper
- [PM2 Documentation](https://pm2.keymetrics.io/)
- Backend logs: Check application logs for webhook processing details
