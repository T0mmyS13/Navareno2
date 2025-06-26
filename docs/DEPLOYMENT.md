# Deployment Guide

This guide covers various deployment options for the Navařeno application.

## 🚀 Vercel Deployment (Recommended)

Vercel is the recommended platform for deploying Next.js applications, offering seamless integration and automatic deployments.

### Prerequisites
- GitHub/GitLab/Bitbucket repository
- Vercel account
- Neon Database (or other PostgreSQL database)

### Step-by-Step Guide

1. **Push your code to a Git repository**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your Git provider
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   In Vercel dashboard, go to Project Settings → Environment Variables:
   
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@hostname/database
   
   # NextAuth
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-production-secret-key
   
   # Email Configuration
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=your-app-password
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_FROM=your-email@gmail.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application
   - Your app will be available at `https://your-project.vercel.app`

### Automatic Deployments
- Every push to `main` branch triggers automatic deployment
- Preview deployments are created for pull requests
- Rollback to previous deployments is available

## 🌐 Netlify Deployment

Alternative deployment option with similar features to Vercel.

### Step-by-Step Guide

1. **Build Configuration**
   Create `netlify.toml` in project root:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy to Netlify**
   - Connect repository to Netlify
   - Set environment variables
   - Deploy

## 🐳 Docker Deployment

For containerized deployment on any platform.

### Dockerfile
Create `Dockerfile` in project root:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - EMAIL_SERVER_USER=${EMAIL_SERVER_USER}
      - EMAIL_SERVER_PASSWORD=${EMAIL_SERVER_PASSWORD}
      - EMAIL_SERVER_HOST=${EMAIL_SERVER_HOST}
      - EMAIL_SERVER_PORT=${EMAIL_SERVER_PORT}
      - EMAIL_FROM=${EMAIL_FROM}
    env_file:
      - .env.production
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=navareno
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Deploy with Docker
```bash
# Build and run
docker-compose up --build

# Run in production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## ☁️ AWS Deployment

Deploy to AWS using various services.

### AWS Amplify
1. Connect repository to AWS Amplify
2. Configure build settings
3. Set environment variables
4. Deploy automatically

### AWS ECS/Fargate
1. Build Docker image
2. Push to ECR
3. Create ECS task definition
4. Deploy to Fargate

### AWS Lambda (Serverless)
Use `@sls-next/lambda` for serverless deployment:
```bash
npm install -g serverless
npm install @sls-next/lambda
```

## 🔵 DigitalOcean App Platform

1. **Connect Repository**
   - Link your GitHub repository
   - Choose branch for deployment

2. **Configure Build**
   - Build Command: `npm run build`
   - Run Command: `npm start`

3. **Environment Variables**
   Set all required environment variables

4. **Database**
   - Use DigitalOcean Managed PostgreSQL
   - Or connect to external database

## 🛠️ Self-Hosted Deployment

Deploy on your own server using PM2.

### Prerequisites
- Ubuntu/CentOS server
- Node.js 18+
- PostgreSQL
- Nginx (reverse proxy)

### Installation Steps

1. **Install Dependencies**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   npm install -g pm2
   
   # Install PostgreSQL
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Setup Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE navareno;
   CREATE USER navareno_user WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE navareno TO navareno_user;
   \q
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd navareno2
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Create PM2 ecosystem file
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'navareno',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000,
         DATABASE_URL: 'postgresql://navareno_user:password@localhost/navareno',
         NEXTAUTH_URL: 'https://your-domain.com',
         NEXTAUTH_SECRET: 'your-secret-key'
       }
     }]
   }
   EOF
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use different secrets for production
- Rotate secrets regularly

### Database Security
- Use SSL connections
- Implement proper access controls
- Regular backups
- Monitor for suspicious activity

### Application Security
- Enable CORS properly
- Implement rate limiting
- Use HTTPS in production
- Regular security updates

## 📊 Monitoring & Logging

### Error Monitoring
- Use Sentry for error tracking
- Set up alerts for critical errors
- Monitor performance metrics

### Logging
```javascript
// Add to your application
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health Checks
Create health check endpoint:
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
}
```

## 🔄 CI/CD Pipeline

Example GitHub Actions workflow:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📝 Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test user registration and login
- [ ] Test recipe creation and viewing
- [ ] Test search functionality
- [ ] Test favorites functionality
- [ ] Verify email sending works
- [ ] Check database connections
- [ ] Test on mobile devices
- [ ] Set up monitoring and alerts
- [ ] Configure automated backups
- [ ] Test error handling
- [ ] Verify SSL certificate
- [ ] Set up domain and DNS
- [ ] Configure CDN if needed
