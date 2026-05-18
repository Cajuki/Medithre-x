# Deployment Instructions for Medithrex Backend - Email Credentials Removed

## Summary
Changes made:
1. Modified backend/utils/email.js to use a mock transporter when email credentials are not set
2. Cleared EMAIL_USER and EMAIL_PASS in backend/.env (credentials removed)
3. Forgot password links will still work (token generation, success messages) but no actual emails will be sent
4. This prevents email authentication errors from crashing the backend

## To Deploy to Cloud Run
Run the following command in an environment where `gcloud` is available (Google Cloud Shell, local machine with gcloud SDK, etc.):

```bash
gcloud run deploy medithre-x \
  --image=gcr.io/famous-robot-473210-r0/medithrex:latest \
  --region=europe-west1 \
  --set-env-vars="PG_HOST=localhost,PG_PORT=5432,PG_DATABASE=medithrex,PG_USER=postgres,PG_PASSWORD=your_password_here,PG_ssl=false,DATABASE_URL=postgresql://neondb_owner:npg_9HMBCikzcq8w@ep-sparkling-surf-absbdv2x-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require,JWT_SECRET=medithrex_super_secret_key_2024,EMAIL_HOST=smtp.gmail.com,EMAIL_PORT=587,EMAIL_SECURE=false,EMAIL_USER=,EMAIL_PASS=,EMAIL_FROM=Medithrex <noreply@medithrex.com>,FRONTEND_URL=https://medithre-x.vercel.app,BACKEND_URL=https://medithre-x-180462915671.europe-west1.run.app,CLOUDINARY_CLOUD_NAME=chimzfix,CLOUDINARY_API_KEY=666252221762671,CLOUDINARY_API_SECRET=MJY5KRhZpyO39ApAzYs2mQHjCn8"
```

## Important Notes
1. Replace `your_password_here` with your actual PostgreSQL password if needed for local testing (though Cloud Run uses the DATABASE_URL)
2. Notice that EMAIL_USER= and EMAIL_PASS= are now empty (no credentials)
3. After running the command, wait for deployment to complete (2-3 minutes)
4. Wait an additional 60 seconds for the service to be ready
5. Then try accessing the forgot password functionality - it will show success messages but no actual emails will be sent

## Verification
After deployment, check the Cloud Run logs for:
- Mock email notifications showing "[MOCK] Password reset email sent (simulated)"
- No email authentication errors
- Normal operation of forgot password flow (token generation, success messages)

## Alternative: Manual Environment Variable Update
If you prefer not to rebuild the image, you can update the existing service:
1. Go to Google Cloud Console → Cloud Run → medithre-x
2. Click "Edit and Deploy New Revision"
3. Go to "Variables & Secrets" tab
4. Set EMAIL_USER= and EMAIL_PASS= to empty values
5. Keep all other variables as before
6. Click "Deploy"