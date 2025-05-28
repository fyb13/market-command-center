# Market Command Center - Deployment Guide

This guide provides instructions for deploying the Market Command Center dashboard.

## Project Structure

The project consists of two main parts:
- **Backend**: Node.js/Express server with Socket.IO for real-time updates
- **Frontend**: React application with Tailwind CSS

## Backend Deployment

1. Install dependencies:
   ```
   cd backend
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
   npm start
   ```

4. For production deployment, uncomment the cron job in `server.js`:
   ```javascript
   // Production cron schedule for GST time zone (UTC+4)
   cron.schedule('0 6,10,14,18 * * *', fetchAllData, {
     timezone: 'Asia/Dubai' // GST timezone
   });
   ```

## Frontend Deployment

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   REACT_APP_BACKEND_URL=http://your-backend-url:5000
   ```

3. Build the production version:
   ```
   npm run build
   ```

4. Serve the static files using a web server of your choice (Nginx, Apache, etc.)

## Acceptance Tests

The following tests should be run after deployment:

1. **GET "/" returns status 200 and page loads < 2s first view**
   - Open the frontend URL in a browser
   - Verify that the page loads in less than 2 seconds

2. **Socket.IO pushes new data without full-page refresh**
   - Wait until 10:05 GST
   - Verify that the data updates without a full page refresh

3. **At least 4 of 5 news sources and both X accounts deliver content**
   - Check that news and tweets are displayed
   - Verify that missing feeds show error badges

4. **Portfolio total equals sum of individual rows within ±0.5%**
   - Check that the portfolio total value matches the sum of individual holdings

## Troubleshooting

If you encounter any issues:

1. **Backend not responding**
   - Check that the server is running
   - Verify that the PORT environment variable is set correctly

2. **Frontend not connecting to backend**
   - Check that the REACT_APP_BACKEND_URL is set correctly
   - Verify that CORS is properly configured on the backend

3. **Data not updating**
   - Check the server logs for any errors
   - Verify that the cron job is running correctly

4. **Socket.IO connection issues**
   - Check browser console for connection errors
   - Verify that the Socket.IO server is running and accessible
