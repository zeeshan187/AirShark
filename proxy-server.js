// Simple proxy server to handle CORS issues
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

// Create proxy middleware for Twitter API
const twitterApiProxy = createProxyMiddleware({
  target: 'https://api.twitterapi.io',
  changeOrigin: true,
  pathRewrite: {
    '^/api/twitter': '', // Remove the /api/twitter prefix
  },
  onProxyRes: function(proxyRes, req, res) {
    // Add CORS headers to the proxied response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key';
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy error: ' + err.message);
  }
});

// Use the proxy middleware for requests to /api/twitter
app.use('/api/twitter', twitterApiProxy);

// Start the server
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
}); 