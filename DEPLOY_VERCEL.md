# Deploy to Vercel with Environment Variables

## Option 1: Vercel Dashboard (Recommended)

### Step 1: Install Vercel CLI (optional but helpful)
```bash
npm i -g vercel
```

### Step 2: Add Environment Variables via Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project (or create new)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_fAQx6D4qZrbe@ep-hidden-poetry-adf43dz8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `JWT_SECRET` | Generate a strong random string (see below) |
| `GEMINI_API_KEY` | Your Google Gemini API key |

### Step 3: Generate a Strong JWT Secret
```bash
# Run this in terminal to generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and add it as `JWT_SECRET` in Vercel.

---

## Option 2: Using Vercel CLI

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Add environment variables
vercel env add DATABASE_URL
# Paste: postgresql://neondb_owner:npg_fAQx6D4qZrbe@ep-hidden-poetry-adf43dz8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

vercel env add JWT_SECRET
# Paste your generated secret

vercel env add GEMINI_API_KEY
# Paste your Gemini API key

# Deploy
vercel --prod
```

---

## Environment Variables Summary

Copy and paste these into Vercel:

```
DATABASE_URL=postgresql://neondb_owner:npg_fAQx6D4qZrbe@ep-hidden-poetry-adf43dz8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=<generate-strong-secret>

GEMINI_API_KEY=<your-gemini-api-key>
```

---

## Important Notes

1. **Frontend API URL**: In Vercel, the frontend and backend run on the same domain, so the API calls will use relative URLs. The `VITE_API_URL` is not needed in production.

2. **Database**: Neon connection string is already set up with SSL required for production.

3. **CORS**: The backend CORS is configured to allow all origins. For production, you may want to restrict this to your Vercel domain.

4. **Deploy**: After setting env vars, redeploy:
   ```bash
   vercel --prod
   ```
