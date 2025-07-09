# Vercel Deployment Setup Guide

This guide explains how to configure Vercel deployment for the SII Frontend v2 project.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. GitHub repository access with admin permissions
3. The Vercel CLI installed locally (optional): `npm i -g vercel`

## Step 1: Connect GitHub Repository to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `rodrigozoofi/sii-front-v2`
4. Configure the project:
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

## Step 2: Configure Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

### Production Environment:
- `NEXT_PUBLIC_API_URL`: Your production API URL (e.g., https://api.sii-accounting.com)
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: Your Firebase measurement ID (optional)

### Development Environment:
Same variables but with development/staging values.

## Step 3: Get Vercel Tokens for GitHub Actions

1. Go to https://vercel.com/account/tokens
2. Create a new token with a descriptive name (e.g., "GitHub Actions SII Frontend")
3. Copy the token (you won't be able to see it again)

## Step 4: Get Project and Org IDs

### Using Vercel CLI:
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your local project to Vercel
vercel link

# Get the project info
vercel project ls
```

### Using Vercel Dashboard:
1. Go to your project settings in Vercel
2. The URL will be: `https://vercel.com/[TEAM_NAME]/[PROJECT_NAME]/settings`
3. In Project Settings → General, you'll find:
   - Project ID (looks like: `prj_xxxxxxxxxxxx`)
   - Team ID (this is your Org ID for GitHub Actions, looks like: `team_xxxxxxxxxxxx`)

## Step 5: Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add these repository secrets:

- `VERCEL_TOKEN`: The token from Step 3
- `VERCEL_PROJECT_ID`: Your project ID from Step 4
- `VERCEL_ORG_ID`: Your Team ID from Step 4 (yes, use your Team ID here)

Optional (for notifications):
- `SLACK_WEBHOOK`: Your Slack webhook URL for deployment notifications

## Step 6: Verify GitHub Actions

After adding the secrets, your GitHub Actions should work:

1. Push to `develop` branch → Triggers development deployment
2. Push to `main` branch → Triggers production deployment

## Troubleshooting

### Deployment Fails
- Check that all secrets are correctly set in GitHub
- Verify that environment variables are set in Vercel
- Check the GitHub Actions logs for specific error messages

### Build Fails
- Ensure all required environment variables are set
- Check that the build command works locally: `npm run build`
- Review build logs in Vercel dashboard

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correctly set for each environment
- Check CORS settings if API calls fail
- Ensure API is accessible from Vercel's servers

## Current Deployment URLs

- Production: Will be set after first deployment to main
- Development: `sii-front-v2-dev.vercel.app` (configured in deploy-dev.yml)

## Notes

- The project uses Next.js 15 with Turbopack
- Security headers are configured in `vercel.json`
- Automatic deployments are enabled for both `main` and `develop` branches
- Each deployment gets a unique URL, but aliases are set for consistent access