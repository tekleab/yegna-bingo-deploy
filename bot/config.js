const config = {
  development: {
    BOT_TOKEN: process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',
    WEB_UI_URL: 'http://localhost:3000',
    PORT: 3001,
    MONGODB_URI: process.env.MONGODB_URI || 'YOUR_MONGODB_URI_HERE',
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN_HERE'
  },
  production: {
    BOT_TOKEN: process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',
    WEB_UI_URL: process.env.WEB_UI_URL || process.env.RAILWAY_STATIC_URL || 'https://your-frontend-url.vercel.app',
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI || 'YOUR_MONGODB_URI_HERE',
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN_HERE'
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env]; 