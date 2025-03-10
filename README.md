# AirShark Droplet Finder

A tool for finding potential Solana airdrops on Twitter.

## CORS Issue Fix

We've identified a CORS (Cross-Origin Resource Sharing) issue when the application tries to directly communicate with the Twitter API from the browser. This is a common security restriction in browsers that prevents web pages from making requests to a different domain than the one serving the web page.

### Solution: Proxy Server

To solve this issue, we've created a simple proxy server that will handle requests to the Twitter API.

#### Running the Application with Proxy

1. Install dependencies:
```bash
npm install
```

2. Start the proxy server:
```bash
npm run proxy
```

This will start the proxy server on http://localhost:3002.

3. In a separate terminal, start the development server:
```bash
npm run dev
```

4. Or run both simultaneously:
```bash
npm run dev:all
```

## How It Works

- The proxy server receives requests from the browser at `http://localhost:3002/api/twitter/*`
- It forwards these requests to `https://api.twitterapi.io/*` with your API key
- The response from Twitter is sent back to your browser
- This way, the browser only communicates with the proxy server on localhost, avoiding CORS issues

## API Testing

The "Test Twitter API" button now tests the connection through the proxy server. Make sure the proxy server is running when using this feature.

## Fallback Mechanism

If the API connection still fails, the application will automatically fall back to displaying mock data, ensuring a smooth user experience.

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub (already done)
2. Sign up or log in to [Vercel](https://vercel.com)
3. Click "Add New" > "Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Make sure to add any required environment variables
6. Click "Deploy"

### Proxy Server Deployment (Railway)

1. Sign up or log in to [Railway](https://railway.app)
2. Create a new project and select "Deploy from GitHub repo"
3. Choose your repository
4. Add the environment variable:
   - Key: `X_API_KEY`
   - Value: Your Twitter API key
5. Railway will automatically detect the Node.js project and deploy it
6. After deployment, get the Railway URL and update the `.env.production` file with:
   ```
   VITE_PROXY_URL=https://your-railway-app-url/api/twitter/tweet/advanced_search
   ```
7. Redeploy your frontend on Vercel after updating the environment variable
#   A i r S h a r k  
 