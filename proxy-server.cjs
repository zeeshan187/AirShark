// Simple proxy server to handle CORS issues
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');

const app = express();
const port = process.env.PORT || 3002;

// Enable CORS for all routes
app.use(cors());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Create proxy middleware for Twitter API
const twitterApiProxy = createProxyMiddleware({
  target: 'https://api.twitterapi.io',
  changeOrigin: true,
  pathRewrite: {
    '^/api/twitter': '/twitter', // Change to keep the /twitter part in the path
  },
  // Use a custom agent with longer timeout
  agent: new https.Agent({ 
    keepAlive: true,
    timeout: 30000, // 30 seconds timeout
    rejectUnauthorized: false // Allow self-signed certificates
  }),
  onProxyReq: (proxyReq, req, res) => {
    // Fix headers - remove the host header that was automatically added
    proxyReq.removeHeader('host');
    proxyReq.setHeader('host', 'api.twitterapi.io');
    
    // Make sure the API key is properly set
    if (req.headers['x-api-key']) {
      proxyReq.setHeader('X-API-Key', req.headers['x-api-key']);
    }
    
    // Log the outgoing request
    console.log(`[Proxy] Request -> ${req.method} ${proxyReq.path}`);
    console.log(`[Proxy] Request Headers:`, JSON.stringify(proxyReq.getHeaders(), null, 2).replace(/(["'])((?:\1|.)*?)\1/g, (match, quote, content) => {
      // Hide the API key in logs
      return content.includes('API-Key') ? `${quote}X-API-Key: *****${quote}` : match;
    }));
  },
  onProxyRes: function(proxyRes, req, res) {
    // Add CORS headers to the proxied response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, X-API-Key';
    
    // Log the response status
    console.log(`[Proxy] Response <- ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
    
    // Log response headers for debugging
    console.log('[Proxy] Response Headers:', JSON.stringify(proxyRes.headers, null, 2));
    
    // For error responses, try to capture the body to see the error message
    if (proxyRes.statusCode >= 400) {
      let responseBody = '';
      proxyRes.on('data', (chunk) => {
        responseBody += chunk;
      });
      proxyRes.on('end', () => {
        try {
          console.log('[Proxy] Error Response Body:', responseBody);
        } catch (e) {
          console.log('[Proxy] Error parsing response body:', e.message);
        }
      });
    }
  },
  onError: (err, req, res) => {
    console.error('[Proxy] Error:', err);
    console.error('[Proxy] Error Stack:', err.stack);
    res.status(500).send(`Proxy error: ${err.message}`);
  }
});

// Use the proxy middleware for requests to /api/twitter
app.use('/api/twitter', twitterApiProxy);

// Add a test endpoint
app.get('/test', (req, res) => {
  res.send('Proxy server is running correctly');
});

// Start the server
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
  console.log(`Test the proxy with: http://localhost:${port}/test`);
}); 