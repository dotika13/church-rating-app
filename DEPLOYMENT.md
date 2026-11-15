# Sanctum - Deployment Guide

This guide covers deploying the Sanctum church rating app to Vercel with Supabase backend.

## Prerequisites

- Vercel account (free tier)
- Supabase account (free tier)
- GitHub/GitLab/Bitbucket repository

## 1. Supabase Setup

### Create a New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization, name your project (e.g., "sanctum")
4. Set a strong database password
5. Choose a region close to your users
6. Wait for project to be ready (~2 minutes)

### Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Run the migration files from `drizzle/` folder in order, OR:
3. Use the Drizzle CLI (recommended):
   ```bash
   # Set environment variables
   export DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   
   # Push schema to database
   npx drizzle-kit push
   ```

### Configure Authentication

1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. Configure **Site URL**: `https://your-app.vercel.app`
4. Add **Redirect URLs**:
   - `https://your-app.vercel.app/callback`
   - `http://localhost:3000/callback` (for local dev)
5. Optionally configure email templates

### Configure Storage

1. Go to **Storage** → **Buckets**
2. Create bucket named `church-media`
3. Set bucket to **Public** (for church images)
4. Add **RLS Policies**:
   ```sql
   -- Allow public read access
   CREATE POLICY "Public read access" ON storage.objects
   FOR SELECT USING (bucket_id = 'church-media');
   
   -- Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'church-media' AND auth.role() = 'authenticated');
   
   -- Allow users to delete their own uploads
   CREATE POLICY "Users can delete own uploads" ON storage.objects
   FOR DELETE USING (bucket_id = 'church-media' AND auth.uid() = owner);
   ```

### Get API Keys

From **Settings** → **API**:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## 2. Vercel Deployment

### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account/team
# - Link to existing project? No (create new)
# - Project name: sanctum
# - Directory: ./
# - Override settings? No
```

### Option B: GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Configure Environment Variables

In Vercel Project Settings → **Environment Variables**, add:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production, Preview |

### Deploy

Click **Deploy** - Vercel will build and deploy automatically.

## 3. Post-Deployment Setup

### Verify Deployment

1. Visit your Vercel URL
2. Test authentication flow (register/login)
3. Create a group and invite members
4. Add a church on the map
5. Submit a rating with media upload
6. Check real-time updates work

### Configure Cron Job

The `/api/aggregates/refresh` endpoint runs hourly via Vercel Cron (configured in `vercel.ts`). Verify in Vercel Dashboard → **Functions** → **Crons**.

### Custom Domain (Optional)

1. In Vercel Project Settings → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` and Supabase redirect URLs

## 4. Local Development

```bash
# Clone repository
git clone <your-repo>
cd church-rating-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# (Get from Supabase Dashboard → Settings → API)

# Run database migrations locally (optional)
npx drizzle-kit push

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 5. Monitoring & Maintenance

### Vercel Analytics

Enable in Vercel Project Settings → **Analytics** for:
- Web Vitals
- Page views
- Function performance

### Supabase Monitoring

Monitor in Supabase Dashboard:
- **Database** → **Logs** for query performance
- **Auth** → **Logs** for authentication events
- **Storage** → **Usage** for media storage
- **Realtime** → **Logs** for subscription health

### Database Maintenance

Run periodically (or set up pg_cron):
```sql
-- Refresh materialized view manually if needed
REFRESH MATERIALIZED VIEW CONCURRENTLY church_aggregates;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables WHERE schemaname = 'public';
```

## 6. Troubleshooting

### Build Failures

- Check Vercel build logs
- Verify all environment variables are set
- Ensure `NEXT_PUBLIC_` variables are prefixed correctly

### Authentication Issues

- Verify Supabase redirect URLs match deployed domain
- Check middleware.ts cookie settings
- Ensure `NEXT_PUBLIC_APP_URL` is correct

### Media Upload Failures

- Verify Storage bucket exists and is public
- Check RLS policies on storage.objects
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel

### Map Not Loading

- Check browser console for MapLibre errors
- Verify MapLibre GL CSS is loaded
- Check network tab for tile loading issues

### Realtime Not Working

- Verify Supabase Realtime is enabled (Database → Replication)
- Check that tables have `REPLICA IDENTITY FULL`
- Ensure WebSocket connections aren't blocked

## 7. Cost Optimization (Free Tier Limits)

### Vercel Free Tier
- 100 GB bandwidth/month
- 100 GB-hours serverless execution
- 1,000 cron executions/month
- 100 GB edge storage

### Supabase Free Tier
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users
- 2 GB Realtime messages

### Tips to Stay Within Limits

1. **Optimize images** - Use WebP, resize before upload
2. **Cache aggressively** - Static pages, API responses
3. **Limit cron frequency** - Hourly is sufficient for aggregates
4. **Monitor usage** - Check Vercel/Supabase dashboards weekly

## 8. Scaling Considerations

When outgrowing free tiers:

1. **Vercel Pro** - $20/month for more bandwidth, execution time
2. **Supabase Pro** - $25/month for 8 GB database, 100 GB storage
3. **Database optimization** - Add indexes, partition large tables
4. **CDN for media** - Cloudflare R2 or AWS S3 for large media files
5. **Edge functions** - Move latency-sensitive logic to edge

## 9. Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` only in Vercel env (not client)
- [ ] RLS policies enabled on all tables
- [ ] Storage bucket policies configured
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] CORS headers configured for API routes
- [ ] Rate limiting on auth endpoints
- [ ] Content Security Policy headers (configure in middleware.ts)

---

## Quick Reference Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Run migrations
npx drizzle-kit push

# Open Drizzle Studio
npx drizzle-kit studio

# Lint code
npm run lint

# Deploy to Vercel (CLI)
vercel --prod

# View Vercel logs
vercel logs <deployment-url>
```

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **MapLibre GL Docs**: https://maplibre.org/maplibre-gl-js/docs/