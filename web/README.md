# The Tribe Discord Bot - Web Dashboard

A simple web interface to monitor the status of The Tribe Discord bot without requiring authentication.

## Features

- **Real-time Bot Status**: Shows if the bot is online/offline, server count, user count, and ping
- **System Monitoring**: Displays uptime, memory usage, and system health
- **Database Status**: MongoDB connection status and state
- **Auto-refresh**: Automatically updates every 30 seconds
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **No Authentication**: Public dashboard accessible to anyone

## Accessing the Dashboard

The web dashboard is automatically served by the bot's health check server:

```
http://localhost:15015
```

## Files

- `index.html` - Main dashboard page
- `style.css` - Responsive styling with modern design
- `script.js` - JavaScript for fetching data and updating the interface

## API Endpoint

The dashboard consumes data from the health check endpoint:

```
GET http://localhost:15015/health
```

Returns JSON with bot status, system info, and database state.

## Technical Details

- **Auto-refresh**: Updates every 30 seconds
- **Error Handling**: Shows connection errors with retry mechanism
- **CORS Enabled**: Allows cross-origin requests
- **Mobile Responsive**: Optimized for all screen sizes
- **Loading States**: Visual feedback during data fetching

## Development

The web interface is served directly by the bot's HTTP server on port 15015. No separate web server is required.

To modify the interface:
1. Edit the HTML, CSS, or JavaScript files
2. Restart the bot container
3. Changes will be immediately available

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Screenshots

The dashboard displays:
- 🤖 Bot status (online/offline, servers, users, ping)
- ⚙️ System info (uptime, memory usage)
- 🗄️ Database status (connection state)
- 🛠️ Available features list

Perfect for monitoring your Discord bot's health and performance!