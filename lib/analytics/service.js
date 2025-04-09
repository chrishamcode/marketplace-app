import mongoose from 'mongoose';

/**
 * Schema for analytics events
 */
const AnalyticsEventSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    index: true
  },
  data: {
    type: Object,
    default: {}
  },
  userId: {
    type: String,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  url: String,
  userAgent: String
});

/**
 * Schema for user activity metrics
 */
const UserActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  pageViews: {
    type: Number,
    default: 0
  },
  interactions: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  sessionCount: {
    type: Number,
    default: 0
  },
  averageSessionDuration: {
    type: Number,
    default: 0
  },
  favoriteCategories: [String],
  searchQueries: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Schema for marketplace metrics
 */
const MarketplaceMetricsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  newUsers: {
    type: Number,
    default: 0
  },
  totalPageViews: {
    type: Number,
    default: 0
  },
  newListings: {
    type: Number,
    default: 0
  },
  completedTransactions: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0
  },
  photoToPostUsage: {
    type: Number,
    default: 0
  },
  topCategories: [{
    category: String,
    count: Number
  }],
  topSearchTerms: [{
    term: String,
    count: Number
  }]
});

/**
 * Schema for seller performance metrics
 */
const SellerPerformanceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  activeListings: {
    type: Number,
    default: 0
  },
  totalListings: {
    type: Number,
    default: 0
  },
  soldItems: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  averageItemPrice: {
    type: Number,
    default: 0
  },
  averageTimeToSell: {
    type: Number,
    default: 0
  },
  responseRate: {
    type: Number,
    default: 0
  },
  responseTime: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create models if they don't exist
const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
const UserActivity = mongoose.models.UserActivity || mongoose.model('UserActivity', UserActivitySchema);
const MarketplaceMetrics = mongoose.models.MarketplaceMetrics || mongoose.model('MarketplaceMetrics', MarketplaceMetricsSchema);
const SellerPerformance = mongoose.models.SellerPerformance || mongoose.model('SellerPerformance', SellerPerformanceSchema);

/**
 * Analytics service for storing and processing analytics data
 */
export class AnalyticsService {
  /**
   * Store analytics events
   * @param {Array} events - Array of analytics events
   * @returns {Promise<Array>} Stored events
   */
  static async storeEvents(events) {
    try {
      const storedEvents = await AnalyticsEvent.insertMany(events);
      
      // Process events to update metrics
      await this.processEvents(events);
      
      return storedEvents;
    } catch (error) {
      console.error('Failed to store analytics events:', error);
      throw error;
    }
  }
  
  /**
   * Process events to update metrics
   * @param {Array} events - Array of analytics events
   */
  static async processEvents(events) {
    try {
      // Group events by user
      const userEvents = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Initialize daily metrics if not exists
      let dailyMetrics = await MarketplaceMetrics.findOne({ date: today });
      if (!dailyMetrics) {
        dailyMetrics = new MarketplaceMetrics({ date: today });
        await dailyMetrics.save();
      }
      
      // Process each event
      for (const event of events) {
        const { category, data, userId, timestamp } = event;
        
        // Skip events without userId
        if (!userId) continue;
        
        // Initialize user events object
        if (!userEvents[userId]) {
          userEvents[userId] = {
            pageViews: 0,
            interactions: 0,
            conversions: 0,
            categories: {},
            searchQueries: []
          };
        }
        
        // Update metrics based on event category
        switch (category) {
          case 'page_view':
            userEvents[userId].pageViews++;
            dailyMetrics.totalPageViews++;
            
            // Track category views
            if (data.path && data.path.startsWith('/listings/category/')) {
              const categoryName = data.path.split('/').pop();
              userEvents[userId].categories[categoryName] = (userEvents[userId].categories[categoryName] || 0) + 1;
            }
            break;
            
          case 'interaction':
            userEvents[userId].interactions++;
            
            // Track listing creation with Photo to Post
            if (data.action === 'create_listing' && data.usePhotoToPost) {
              dailyMetrics.photoToPostUsage++;
              dailyMetrics.newListings++;
            }
            // Track regular listing creation
            else if (data.action === 'create_listing') {
              dailyMetrics.newListings++;
            }
            break;
            
          case 'conversion':
            userEvents[userId].conversions++;
            
            // Track completed transactions
            if (data.type === 'purchase') {
              dailyMetrics.completedTransactions++;
              dailyMetrics.totalSales += data.amount || 0;
              
              // Update seller metrics
              if (data.sellerId) {
                await this.updateSellerMetrics(data.sellerId, {
                  soldItems: 1,
                  totalRevenue: data.amount || 0
                });
              }
            }
            break;
            
          case 'search':
            if (data.query) {
              userEvents[userId].searchQueries.push(data.query);
              
              // Update top search terms
              const termExists = dailyMetrics.topSearchTerms.find(item => item.term === data.query);
              if (termExists) {
                termExists.count++;
              } else if (dailyMetrics.topSearchTerms.length < 20) {
                dailyMetrics.topSearchTerms.push({ term: data.query, count: 1 });
              }
            }
            break;
        }
      }
      
      // Update user activity metrics
      for (const [userId, metrics] of Object.entries(userEvents)) {
        let userActivity = await UserActivity.findOne({ userId });
        
        if (!userActivity) {
          userActivity = new UserActivity({ userId });
          dailyMetrics.newUsers++;
        }
        
        // Update user activity
        userActivity.lastActive = new Date();
        userActivity.pageViews += metrics.pageViews;
        userActivity.interactions += metrics.interactions;
        userActivity.conversions += metrics.conversions;
        userActivity.sessionCount++;
        
        // Update favorite categories
        const categories = Object.entries(metrics.categories)
          .sort((a, b) => b[1] - a[1])
          .map(([category]) => category)
          .slice(0, 5);
          
        if (categories.length > 0) {
          userActivity.favoriteCategories = [...new Set([...categories, ...userActivity.favoriteCategories])].slice(0, 10);
        }
        
        // Update search queries
        if (metrics.searchQueries.length > 0) {
          userActivity.searchQueries = [...metrics.searchQueries, ...userActivity.searchQueries].slice(0, 20);
        }
        
        userActivity.updatedAt = new Date();
        await userActivity.save();
        
        dailyMetrics.activeUsers++;
      }
      
      // Calculate average order value
      if (dailyMetrics.completedTransactions > 0) {
        dailyMetrics.averageOrderValue = dailyMetrics.totalSales / dailyMetrics.completedTransactions;
      }
      
      // Save daily metrics
      await dailyMetrics.save();
      
    } catch (error) {
      console.error('Failed to process analytics events:', error);
    }
  }
  
  /**
   * Update seller performance metrics
   * @param {string} sellerId - Seller user ID
   * @param {Object} updates - Metrics to update
   */
  static async updateSellerMetrics(sellerId, updates) {
    try {
      let sellerMetrics = await SellerPerformance.findOne({ userId: sellerId });
      
      if (!sellerMetrics) {
        sellerMetrics = new SellerPerformance({ userId: sellerId });
      }
      
      // Update metrics
      if (updates.soldItems) {
        sellerMetrics.soldItems += updates.soldItems;
      }
      
      if (updates.totalRevenue) {
        sellerMetrics.totalRevenue += updates.totalRevenue;
      }
      
      if (updates.activeListings !== undefined) {
        sellerMetrics.activeListings = updates.activeListings;
      }
      
      if (updates.totalListings) {
        sellerMetrics.totalListings += updates.totalListings;
      }
      
      if (updates.responseRate !== undefined) {
        sellerMetrics.responseRate = updates.responseRate;
      }
      
      if (updates.responseTime !== undefined) {
        sellerMetrics.responseTime = updates.responseTime;
      }
      
      if (updates.rating && updates.reviewCount) {
        // Calculate new average rating
        const currentTotal = sellerMetrics.rating * sellerMetrics.reviewCount;
        const newTotal = currentTotal + (updates.rating * updates.reviewCount);
        const newCount = sellerMetrics.reviewCount + updates.reviewCount;
        
        sellerMetrics.rating = newTotal / newCount;
        sellerMetrics.reviewCount = newCount;
      }
      
      // Calculate average item price
      if (sellerMetrics.soldItems > 0) {
        sellerMetrics.averageItemPrice = sellerMetrics.totalRevenue / sellerMetrics.soldItems;
      }
      
      sellerMetrics.updatedAt = new Date();
      await sellerMetrics.save();
      
    } catch (error) {
      console.error('Failed to update seller metrics:', error);
    }
  }
  
  /**
   * Get marketplace analytics for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Marketplace analytics
   */
  static async getMarketplaceAnalytics(startDate, endDate) {
    try {
      const metrics = await MarketplaceMetrics.find({
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });
      
      // Calculate totals and averages
      const totals = {
        activeUsers: 0,
        newUsers: 0,
        totalPageViews: 0,
        newListings: 0,
        completedTransactions: 0,
        totalSales: 0,
        photoToPostUsage: 0
      };
      
      metrics.forEach(metric => {
        Object.keys(totals).forEach(key => {
          totals[key] += metric[key] || 0;
        });
      });
      
      // Calculate averages
      const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
      const averages = {
        activeUsersPerDay: totals.activeUsers / days,
        newUsersPerDay: totals.newUsers / days,
        pageViewsPerDay: totals.totalPageViews / days,
        newListingsPerDay: totals.newListings / days,
        transactionsPerDay: totals.completedTransactions / days,
        salesPerDay: totals.totalSales / days,
        photoToPostUsagePerDay: totals.photoToPostUsage / days
      };
      
      // Calculate conversion rates
      const conversionRates = {
        listingToTransaction: totals.completedTransactions / (totals.newListings || 1),
        photoToPostUsageRate: totals.photoToPostUsage / (totals.newListings || 1)
      };
      
      return {
        metrics,
        totals,
        averages,
        conversionRates
      };
      
    } catch (error) {
      console.error('Failed to get marketplace analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get user analytics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User analytics
   */
  static async getUserAnalytics(userId) {
    try {
      const userActivity = await UserActivity.findOne({ userId });
      
      if (!userActivity) {
        return null;
      }
      
      // Get user's events for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const events = await AnalyticsEvent.find({
        userId,
        timestamp: { $gte: thirtyDaysAgo }
      }).sort({ timestamp: 1 });
      
      // Calculate activity by day
      const activityByDay = {};
      events.forEach(event => {
        const day = event.timestamp.toISOString().split('T')[0];
        if (!activityByDay[day]) {
          activityByDay[day] = {
            pageViews: 0,
            interactions: 0,
            conversions: 0
          };
        }
        
        switch (event.category) {
          case 'page_view':
            activityByDay[day].pageViews++;
            break;
          case 'interaction':
            activityByDay[day].interactions++;
            break;
          case 'conversion':
            activityByDay[day].conversions++;
            break;
        }
      });
      
      return {
        userActivity,
        activityByDay,
        recentEvents: events.slice(-50) // Last 50 events
      };
      
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      throw error;
    }
  }
  
  /**
   * Get seller analytics
   * @param {string} sellerId - Seller ID
   * @returns {Promise<Object>} Seller analytics
   */
  static async getSellerAnalytics(sellerId) {
    try {
      const sellerMetrics = await SellerPerformance.findOne({ userId: sellerId });
      
      if (!sellerMetrics) {
        return null;
      }
      
      // Get seller's transactions for the last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const transactions = await AnalyticsEvent.find({
        category: 'conversion',
        'data.type': 'purchase',
        'data.sellerId': sellerId,
        timestamp: { $gte: ninetyDaysAgo }
      }).sort({ timestamp: 1 });
      
      // Calculate sales by day
      const salesByDay = {};
      transactions.forEach(transaction => {
        const day = transaction.timestamp.toISOString().split('T')[0];
        if (!salesByDay[day]) {
          salesByDay[day] = {
            count: 0,
            revenue: 0
          };
        }
        
        salesByDay[day].count++;
        salesByDay[day].revenue += transaction.data.amount || 0;
      });
      
      return {
        sellerMetrics,
        salesByDay,
        recentTransactions: transactions.slice(-20) // Last 20 transactions
      };
      
    } catch (error) {
      console.error('Failed to get seller analytics:', error);
      throw error;
    }
  }
}

export default AnalyticsService;
