const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Ensure public directory exists
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'));
}

// Portfolio data from user input
const portfolioData = {
  "VWRA": 188000,
  "EIMI": 74000,
  "IQQV": 74000,
  "HDLV": 25000,
  "AGGH": 59000,
  "IB01": 30000,
  "IT5H": 25000,
  "SGLN": 50000,
  "CMOD": 25000,
  "Cash": 19000
};

// Macro indicators to track
const macroIndicators = [
  { symbol: "^TNX", name: "US 10-yr Treasury yield" },
  { symbol: "DX-Y.NYB", name: "DXY dollar index" },
  { symbol: "CL=F", name: "WTI crude" },
  { symbol: "GC=F", name: "Gold spot" },
  { symbol: "ES=F", name: "S&P-500 e-mini futures" }
];

// News sources to monitor
const newsSources = [
  { name: "FT Markets", url: "https://www.ft.com/markets?format=rss" },
  { name: "Bloomberg Top Stories", url: "https://www.bloomberg.com/feed/podcast/etf-report" },
  { name: "WSJ Markets", url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml" },
  { name: "Reuters Markets", url: "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best" },
  { name: "Nikkei Asia", url: "https://asia.nikkei.com/rss/feed/markets" }
];

// Twitter accounts to monitor
const twitterAccounts = ["RayDalio", "TheKobeissiLetter"];

// Keywords for news ranking
const newsKeywords = ["rates", "CPI", "Fed", "China", "credit", "default"];

// Function to fetch portfolio data
async function fetchPortfolioData() {
  try {
    const portfolioResults = {};
    let totalValue = 0;
    let totalYesterday = 0;

    for (const [symbol, quantity] of Object.entries(portfolioData)) {
      if (symbol === "Cash") {
        portfolioResults[symbol] = {
          price: 1,
          dayChange: 0,
          ytdChange: 0,
          drawdown: 0,
          value: quantity
        };
        totalValue += quantity;
        totalYesterday += quantity;
        continue;
      }

      try {
        // Fetch current price data
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`);
        const data = response.data.chart.result[0];
        
        if (!data) {
          throw new Error(`No data returned for ${symbol}`);
        }

        const currentPrice = data.meta.regularMarketPrice;
        const previousClose = data.meta.chartPreviousClose;
        const timestamps = data.timestamp;
        const quotes = data.indicators.quote[0].close;
        
        // Calculate YTD change
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const startOfYearTimestamp = Math.floor(startOfYear.getTime() / 1000);
        
        let ytdStartIndex = 0;
        for (let i = 0; i < timestamps.length; i++) {
          if (timestamps[i] >= startOfYearTimestamp) {
            ytdStartIndex = i;
            break;
          }
        }
        
        const ytdStartPrice = quotes[ytdStartIndex] || previousClose;
        const ytdChange = ((currentPrice - ytdStartPrice) / ytdStartPrice) * 100;
        
        // Calculate drawdown (max decline from peak)
        let peak = currentPrice;
        for (let i = quotes.length - 1; i >= 0; i--) {
          if (quotes[i] > peak) {
            peak = quotes[i];
          }
        }
        
        const drawdown = ((currentPrice - peak) / peak) * 100;
        
        // Calculate day change percentage
        const dayChange = ((currentPrice - previousClose) / previousClose) * 100;
        
        // Calculate value
        const value = quantity;
        const valueToday = value * currentPrice;
        const valueYesterday = value * previousClose;
        
        totalValue += valueToday;
        totalYesterday += valueYesterday;
        
        portfolioResults[symbol] = {
          price: currentPrice,
          dayChange,
          ytdChange,
          drawdown,
          value: valueToday
        };
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error.message);
        portfolioResults[symbol] = {
          price: null,
          dayChange: null,
          ytdChange: null,
          drawdown: null,
          value: null,
          error: true
        };
      }
    }
    
    // Calculate total portfolio day change
    const totalDayChange = ((totalValue - totalYesterday) / totalYesterday) * 100;
    
    return {
      holdings: portfolioResults,
      total: {
        value: totalValue,
        dayChange: totalDayChange
      }
    };
  } catch (error) {
    console.error('Error in fetchPortfolioData:', error);
    return { error: 'Failed to fetch portfolio data' };
  }
}

// Function to fetch macro indicators
async function fetchMacroIndicators() {
  try {
    const results = [];
    
    for (const indicator of macroIndicators) {
      try {
        // Fetch current and historical data
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${indicator.symbol}?interval=1h&range=1d`);
        const data = response.data.chart.result[0];
        
        if (!data) {
          throw new Error(`No data returned for ${indicator.symbol}`);
        }
        
        const currentPrice = data.meta.regularMarketPrice;
        const timestamps = data.timestamp;
        const quotes = data.indicators.quote[0].close;
        
        // Calculate 4-hour change
        const fourHoursAgoIndex = Math.max(0, quotes.length - 4);
        const fourHoursAgoPrice = quotes[fourHoursAgoIndex] || quotes[0];
        const fourHourChange = ((currentPrice - fourHoursAgoPrice) / fourHoursAgoPrice) * 100;
        
        // Get last 24 hours of data for sparkline
        const sparklineData = quotes.slice(-24).filter(price => price !== null);
        
        results.push({
          symbol: indicator.symbol,
          name: indicator.name,
          price: currentPrice,
          change4h: fourHourChange,
          sparkline: sparklineData
        });
      } catch (error) {
        console.error(`Error fetching data for ${indicator.symbol}:`, error.message);
        results.push({
          symbol: indicator.symbol,
          name: indicator.name,
          price: null,
          change4h: null,
          sparkline: [],
          error: true
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error in fetchMacroIndicators:', error);
    return { error: 'Failed to fetch macro indicators' };
  }
}

// Function to fetch and rank news
async function fetchNews() {
  try {
    const allNews = [];
    
    for (const source of newsSources) {
      try {
        // In a real implementation, we would use a proper RSS parser
        // For this demo, we'll simulate fetching news
        const mockNews = [
          {
            title: `${source.name}: Fed signals potential rate cuts as inflation eases`,
            link: `https://example.com/${source.name.toLowerCase().replace(/\s+/g, '-')}/1`,
            pubDate: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
            source: source.name
          },
          {
            title: `${source.name}: China's economy shows signs of recovery amid credit concerns`,
            link: `https://example.com/${source.name.toLowerCase().replace(/\s+/g, '-')}/2`,
            pubDate: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
            source: source.name
          },
          {
            title: `${source.name}: Global markets react to latest CPI data`,
            link: `https://example.com/${source.name.toLowerCase().replace(/\s+/g, '-')}/3`,
            pubDate: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
            source: source.name
          }
        ];
        
        allNews.push(...mockNews);
      } catch (error) {
        console.error(`Error fetching news from ${source.name}:`, error.message);
      }
    }
    
    // Filter news from the last 4 hours
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const recentNews = allNews.filter(item => new Date(item.pubDate) > fourHoursAgo);
    
    // Rank news by keyword weight
    recentNews.forEach(item => {
      let weight = 0;
      for (const keyword of newsKeywords) {
        if (item.title.toLowerCase().includes(keyword.toLowerCase())) {
          weight++;
        }
      }
      item.weight = weight;
    });
    
    // Sort by weight and return top 5
    const topNews = recentNews.sort((a, b) => b.weight - a.weight).slice(0, 5);
    
    return topNews;
  } catch (error) {
    console.error('Error in fetchNews:', error);
    return { error: 'Failed to fetch news' };
  }
}

// Function to fetch tweets
async function fetchTweets() {
  try {
    // In a real implementation, we would use the Twitter API
    // For this demo, we'll simulate fetching tweets
    const allTweets = [];
    
    for (const account of twitterAccounts) {
      try {
        const mockTweets = [
          {
            id: `${account}-1`,
            text: `Just published my latest thoughts on market cycles and how they relate to the current economic environment. #investing #markets`,
            created_at: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
            like_count: Math.floor(Math.random() * 1000) + 500,
            author: account,
            summary: "Analyzing market cycles in relation to current economic conditions."
          },
          {
            id: `${account}-2`,
            text: `The Fed's latest decision will have significant implications for bond markets and equity valuations. Here's my analysis...`,
            created_at: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
            like_count: Math.floor(Math.random() * 1000) + 300,
            author: account,
            summary: "Examining Fed decision impacts on bonds and equity valuations."
          },
          {
            id: `${account}-3`,
            text: `China's policy shifts are creating interesting opportunities in emerging markets. I'm particularly watching these sectors...`,
            created_at: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
            like_count: Math.floor(Math.random() * 1000) + 200,
            author: account,
            summary: "Identifying opportunities in emerging markets due to China policy changes."
          }
        ];
        
        allTweets.push(...mockTweets);
      } catch (error) {
        console.error(`Error fetching tweets from ${account}:`, error.message);
      }
    }
    
    // Filter tweets from the last 4 hours
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const recentTweets = allTweets.filter(tweet => new Date(tweet.created_at) > fourHoursAgo);
    
    // Sort by like count and return top 5
    const topTweets = recentTweets.sort((a, b) => b.like_count - a.like_count).slice(0, 5);
    
    return topTweets;
  } catch (error) {
    console.error('Error in fetchTweets:', error);
    return { error: 'Failed to fetch tweets' };
  }
}

// Function to fetch all data and save to file
async function fetchAllData() {
  try {
    console.log('Fetching data at:', new Date().toISOString());
    
    const portfolio = await fetchPortfolioData();
    const macro = await fetchMacroIndicators();
    const news = await fetchNews();
    const tweets = await fetchTweets();
    
    const allData = {
      timestamp: new Date().toISOString(),
      portfolio,
      macro,
      news,
      tweets,
      nextUpdate: getNextUpdateTime()
    };
    
    // Save data to file
    fs.writeFileSync(
      path.join(__dirname, 'public', 'data.json'),
      JSON.stringify(allData, null, 2)
    );
    
    // Emit update event to all connected clients
    io.emit('dataUpdate', { status: 'success' });
    
    console.log('Data updated successfully');
    return allData;
  } catch (error) {
    console.error('Error fetching all data:', error);
    io.emit('dataUpdate', { status: 'error', message: error.message });
    return { error: 'Failed to fetch data' };
  }
}

// Function to get next update time (06:00, 10:00, 14:00, 18:00 GST)
function getNextUpdateTime() {
  const now = new Date();
  const gstOffset = 4; // GST is UTC+4
  
  // Convert current time to GST
  const gstHours = (now.getUTCHours() + gstOffset) % 24;
  const gstMinutes = now.getUTCMinutes();
  
  // Determine next update hour
  let nextHour;
  if (gstHours < 6) {
    nextHour = 6;
  } else if (gstHours < 10) {
    nextHour = 10;
  } else if (gstHours < 14) {
    nextHour = 14;
  } else if (gstHours < 18) {
    nextHour = 18;
  } else {
    nextHour = 6; // Next day
  }
  
  // Create next update time
  const nextUpdate = new Date(now);
  nextUpdate.setUTCHours((nextHour - gstOffset + 24) % 24);
  nextUpdate.setUTCMinutes(0);
  nextUpdate.setUTCSeconds(0);
  nextUpdate.setUTCMilliseconds(0);
  
  // If next update is tomorrow
  if (nextHour === 6 && gstHours >= 18) {
    nextUpdate.setUTCDate(nextUpdate.getUTCDate() + 1);
  }
  
  return nextUpdate.toISOString();
}

// Schedule data updates
// Note: In production, you would use node-cron to schedule updates at specific times
// For this demo, we'll fetch data on server start and document how to set up the cron job
/*
// Production cron schedule for GST time zone (UTC+4)
cron.schedule('0 6,10,14,18 * * *', fetchAllData, {
  timezone: 'Asia/Dubai' // GST timezone
});
*/

// API endpoint to get the latest data
app.get('/api/data', (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'public', 'data.json');
    
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      res.json(data);
    } else {
      res.status(404).json({ error: 'Data not found' });
    }
  } catch (error) {
    console.error('Error serving data:', error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

// API endpoint to manually trigger data update
app.post('/api/update', async (req, res) => {
  try {
    const data = await fetchAllData();
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send current data to newly connected client
  try {
    const dataPath = path.join(__dirname, 'public', 'data.json');
    
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      socket.emit('initialData', data);
    }
  } catch (error) {
    console.error('Error sending initial data:', error);
  }
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Fetch data on server start
fetchAllData().catch(console.error);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for testing
module.exports = { app, server };
