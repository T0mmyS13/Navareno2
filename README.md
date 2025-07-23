# Navařeno 🍳

**Navařeno** is a modern web application for sharing and managing recipes, built with Next.js 15 and TypeScript. The app offers an intuitive interface for browsing recipes by category, searching, user authentication, and managing favorite recipes.

## 📄 Main Features

- **📱 Responsive Design** - Optimized for all devices
- **🔍 Advanced Search** - Search recipes with suggestions
- **👤 User Accounts** - Registration and login via NextAuth.js
- **❤️ Favorite Recipes** - Save favorite recipes
- **⭐ Rate Recipes** - Rating and comments system
- **📝 Add Recipes** - Add your own recipes
- **🤖 AI Recipe Analysis** - Automatically fill recipe form from food photos (Google Gemini)
- **🗂️ Categories** - Organized categories (Appetizers, Soups, Salads, Main Courses, Desserts, Drinks)
- **🛒 Shopping List** - Generate shopping list from recipes



## 📊 Project Statistics

- **Version:** 0.1.0
- **Dependencies:** 28
- **Dev Dependencies:** 12
- **Source Files:** 43
- **Components:** 7
- **API Endpoints:** 8
- **Last Updated:** 23. 7. 2025

## 🛠️ Technologies

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI (MUI)** - React UI components
- **Framer Motion** - Animations and transitions
- **React QR Code** - Generate QR codes

### Backend & Database
- **Neon Database** - Serverless PostgreSQL
- **NextAuth.js** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending
- **Google Gemini AI** - AI image analysis for recipes (FREE)

### Development Tools
- **ESLint** - Linting
- **PostCSS** - CSS preprocessing
- **ts-node** - TypeScript execution

## 📁 Project Structure

```
navareno2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication
│   │   │   ├── recipes/       # Recipe API
│   │   │   └── favorites/     # Favorite recipes
│   │   ├── auth/              # Auth pages
│   │   ├── [category]/        # Dynamic categories
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   └── ui/                # UI components
│   └── utils/                 # Utility functions
├── public/                    # Static files
│   └── images/                # Images
├── .env                       # Environment variables
└── package.json               # Dependencies
```

## 🚀 Installation & Setup

### Requirements
- Node.js 18+
- npm, yarn, pnpm or bun
- PostgreSQL database (Neon DB)

### 1. Clone Project
```bash
git clone <repository-url>
cd navareno2
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file and set the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email (Nodemailer)
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_FROM="your-email@gmail.com"

# Google Gemini (for AI image analysis - FREE)
GOOGLE_GEMINI_API_KEY="AIzaSyC-your-gemini-api-key-here"
```

### 4. Initialize Database
```bash
npm run seed-db
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 NPM Scripts

```bash
npm run dev        # Run dev server
npm run build      # Build for production
npm run start      # Start production version
npm run seed-db    # Initialize database with test data
```

## 📄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `[...nextauth]` - NextAuth.js endpoints

### Recipes
- `GET /api/recipes` - List all recipes
- `GET /api/recipes/[category]/[recipe]` - Recipe details
- `POST /api/recipes/[category]/[recipe]/rating` - Rate a recipe

### AI Analysis
- `POST /api/analyze-image-gemini` - Analyze food image and generate recipe data (FREE)

### Favorites
- `GET /api/favorites` - User's favorite recipes
- `POST /api/favorites` - Add/remove favorite

## 🎨 UI Components

### Main Components
- `Category.tsx` - Category component
- `Food.tsx` - Recipe component
- `RecipeCard.tsx` - Card for recipe preview
- `SearchWithSuggestions.tsx` - Search bar with suggestions
- `HeaderLink.tsx` - Navigation header
- `Footer.tsx` - Page footer
- `SessionProviderWrapper.tsx` - NextAuth session provider

### UI Components (src/components/ui)
- `Button.tsx`, `Select.tsx`, `Input.tsx`, `Alert.tsx`, `Card.tsx`, `Textarea.tsx`

### Utility Components
- `ToastNotify.tsx` - Toast notifications

## 🚀 Deployment

### Vercel (Recommended)
1. Connect project to Vercel
2. Set environment variables
3. Deploy automatically on push to main branch

### Other Platforms
1. `npm run build` - Create production build
2. `npm run start` - Start production version
3. Set environment variables on hosting platform

## 🔧 Configuration

### Environment Variables
See "Environment Configuration" section above.

### Database Schema
Database schema is automatically created using `seed-db` script.

## 🐞 Troubleshooting

### Common Issues
1. **Database Connection** - Check DATABASE_URL
2. **NextAuth Errors** - Verify NEXTAUTH_SECRET and NEXTAUTH_URL
3. **Email Not Sending** - Check SMTP settings
4. **AI Analysis Not Working** - Check GOOGLE_GEMINI_API_KEY

### Logs
```bash
# Check logs in development mode
npm run dev
```

## 🤖 AI Features

For detailed information about the AI image analysis feature, see [GEMINI_SETUP.md](docs/GEMINI_SETUP.md).

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is private and not intended for public use.

## 👨‍💻 Author

Created for study purposes and personal use.

---

**Navařeno** - Cooking has never been easier! 🍳✨