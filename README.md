# Market Command Center - Backend

This is the backend server for the Market Command Center dashboard. It provides data for the portfolio, macro indicators, news, and tweets modules.

## Features

- Express server with Socket.IO for real-time updates
- Data fetching for portfolio, macro indicators, news, and tweets
- API endpoints for data retrieval and manual updates
- Scheduled data updates (configured for production)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=5000
   ALPHAVANTAGE_KEY=your_alphavantage_key
   X_BEARER_TOKEN=your_twitter_bearer_token
   ```

3. Start the server:
   ```
   node server.js
   ```

## API Endpoints

- `GET /api/data` - Get the latest dashboard data
- `POST /api/update` - Manually trigger a data update

## Production Deployment

For production deployment, uncomment the cron job in `server.js`:

```javascript
// Production cron schedule for GST time zone (UTC+4)
cron.schedule('0 6,10,14,18 * * *', fetchAllData, {
  timezone: 'Asia/Dubai' // GST timezone
});
```

This will schedule data updates at 06:00, 10:00, 14:00, and 18:00 GST.

## Socket.IO Events

- `connection` - Client connected
- `dataUpdate` - Data has been updated
- `initialData` - Initial data sent to newly connected client
