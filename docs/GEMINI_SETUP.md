# Google Gemini AI - Setup (FREE)

## Overview
The application now uses Google Gemini AI for food image analysis. This service is **FREE** and does not require a credit card!

## ✅ Benefits of Google Gemini:
- **100% FREE** - No charges
- **15 requests per minute** for free
- **Unlimited daily usage**
- **No credit card** required
- **Excellent image analysis** with Gemini 2.5 Flash
- **More accurate ingredient identification**
- **Better JSON output**

## 🔧 Setup

### 1. Obtain a Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

### 2. Set Environment Variables

#### Local Development
In your `.env.development.local` file, replace:
```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```
with:
```env
GOOGLE_GEMINI_API_KEY=AIzaSyC-your-actual-gemini-key-here
```

#### Production (Vercel)
1. Go to your project's Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add a variable:
   - **Name**: `GOOGLE_GEMINI_API_KEY`
   - **Value**: `AIzaSyC-your-actual-gemini-key-here`
4. Save and redeploy the application

### 3. Using the Feature
1. Go to the "Add New Recipe" page
2. Upload a food image
3. Click the "AI Analyze" button
4. Wait for the analysis (usually 3-5 seconds)
5. The form will be auto-filled
6. Review and edit the data if needed
7. Save the recipe


## 🎯 How it Works

1. **Image Upload**: The user uploads a photo of food
2. **AI Analysis**: The image is sent to the Google Gemini API
3. **Analysis**: The AI analyzes the image and identifies:
   - Type of food
   - Ingredients (by appearance)
   - Estimated preparation time
   - Number of servings
   - Difficulty
   - Category
4. **Auto-fill**: The data is automatically inserted into the form
5. **Edit**: The user can review and edit the data

## 📊 Limitations
- **15 requests per minute** (sufficient for most users)
- **Maximum image size**: 4MB
- **Supported formats**: JPEG, PNG, WebP, GIF

## 💰 Costs
- **FREE** - No charges
- **Unlimited daily usage**
- **No hidden fees**

## 🔒 Security
- API key is stored only on the server
- Images are not stored permanently
- Analysis occurs only on user request

## 🐛 Troubleshooting

### "Invalid API key" Error
- Check that GOOGLE_GEMINI_API_KEY is set correctly
- Make sure the key starts with `AIzaSyC`
- Try creating a new key

### "Quota exceeded" Error
- Wait 1 minute and try again
- You have a limit of 15 requests per minute

### Slow Analysis
- Reduce the image size
- Use JPEG format
- Check your internet connection

## 🎉 User Benefits

- **No charges** - the feature is 100% free
- **Instant use** - no credit card registration
- **Reliability** - Google infrastructure
- **Quality** - excellent analysis results 