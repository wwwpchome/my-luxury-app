# Chronos - Your Story Timeline

A luxurious timeline app for your daily stories, built with Next.js 14, Supabase, and TypeScript.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/chronos)

## Features

- 📅 **Calendar View** - View your stories organized by date
- 📝 **Story Creation** - Create stories with text, images, and mood colors
- 🔒 **Privacy Settings** - Choose between "Everyone Visible" or "Only Me" for each story
- 👥 **Plaza Mode** - View public stories from all users
- ✏️ **Edit & Delete** - Full CRUD operations on your stories
- 🎨 **Elegant UI** - Beautiful, minimalist design with Framer Motion animations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth (Email/Password, OAuth)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Animations**: Framer Motion
- **Data Fetching**: SWR

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-luxury-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key  # Optional, for AI polish feature
```

4. Set up the database:
   - Go to Supabase Dashboard → SQL Editor
   - Execute the SQL scripts in the `sql/` directory in order:
     1. `sql/supabase-schema.sql` - Create stories table
     2. `sql/FIX_USER_ID.sql` - Add user_id field and RLS policies
     3. `sql/ADD_PRIVACY_SETTINGS.sql` - Add privacy settings
     4. `sql/CREATE_STORAGE_BUCKET.sql` - Create storage bucket
     5. `sql/UPDATE_STORAGE_RLS_FOR_USER_FOLDERS.sql` - Set up storage RLS

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
my-luxury-app/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Auth callback route
│   ├── login/             # Login page
│   ├── plaza/             # Plaza mode page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── shared/           # Shared components
│   └── ui/               # UI components (Shadcn)
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase clients
│   └── stories.ts        # Story-related functions
├── sql/                   # Database SQL scripts
├── docs/                  # Documentation files
└── scripts/               # Utility scripts
```

## Features Guide

### Creating a Story

1. Click on any hour slot in the timeline
2. Write your story in the editor
3. Optionally add an image
4. Select a mood color
5. Choose privacy setting (Everyone Visible or Only Me)
6. Click "Publish Moment"

### Editing a Story

1. Hover over a story card
2. Click the edit icon
3. Make your changes
4. Click "Update Story"

### Plaza Mode

- View all public stories from all users
- Filter by date using the calendar
- Stories are sorted by time

## Deployment

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel project settings
4. Configure Supabase OAuth callback URL
5. Deploy!

See `DEPLOY.md` for quick deployment steps or `docs/DEPLOYMENT_GUIDE.md` for complete guide.

### Environment Variables

**Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Optional:**
```env
OPENAI_API_KEY=sk-...  # For AI polish feature
```

### Pre-Deployment Checklist

Before deploying, execute these SQL scripts in Supabase Dashboard (in order):

1. `sql/supabase-schema.sql` - Create stories table
2. `sql/FIX_USER_ID.sql` - Add user_id and RLS
3. `sql/ADD_PRIVACY_SETTINGS.sql` - Add privacy settings
4. `sql/CREATE_STORAGE_BUCKET.sql` - Create storage bucket

See `docs/DEPLOYMENT_CHECKLIST.md` for complete checklist.

## Documentation

See the `docs/` directory for detailed documentation:
- `DEPLOY.md` - Quick deployment guide
- `docs/DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `docs/QUICK_DEPLOY.md` - 5-minute deployment guide
- `docs/TROUBLESHOOTING.md` - Common issues and solutions
- `docs/DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist
- Database setup guides
- Storage configuration
- Privacy settings guide

## License

Private project
