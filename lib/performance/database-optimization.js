import mongoose from 'mongoose';

/**
 * Optimizes database queries by adding indexes to frequently queried fields
 */
export const setupDatabaseIndexes = async () => {
  // User model indexes
  await mongoose.model('User').createIndexes();
  
  // Listing model indexes
  const Listing = mongoose.model('Listing');
  await Listing.collection.createIndex({ title: 'text', description: 'text' });
  await Listing.collection.createIndex({ category: 1 });
  await Listing.collection.createIndex({ price: 1 });
  await Listing.collection.createIndex({ condition: 1 });
  await Listing.collection.createIndex({ createdAt: -1 });
  await Listing.collection.createIndex({ userId: 1 });
  
  // Message model indexes
  const Message = mongoose.model('Message');
  await Message.collection.createIndex({ conversationId: 1 });
  await Message.collection.createIndex({ sender: 1 });
  await Message.collection.createIndex({ recipient: 1 });
  await Message.collection.createIndex({ createdAt: -1 });
  
  // Offer model indexes
  const Offer = mongoose.model('Offer');
  await Offer.collection.createIndex({ listingId: 1 });
  await Offer.collection.createIndex({ buyerId: 1 });
  await Offer.collection.createIndex({ sellerId: 1 });
  await Offer.collection.createIndex({ status: 1 });
  await Offer.collection.createIndex({ createdAt: -1 });
  
  // Order model indexes
  const Order = mongoose.model('Order');
  await Order.collection.createIndex({ buyerId: 1 });
  await Order.collection.createIndex({ sellerId: 1 });
  await Order.collection.createIndex({ status: 1 });
  await Order.collection.createIndex({ createdAt: -1 });
  
  console.log('Database indexes created successfully');
};

/**
 * Optimizes database connection with connection pooling
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
export const optimizedConnect = async (uri) => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Increase connection pool size
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
  };
  
  try {
    await mongoose.connect(uri, options);
    console.log('Connected to MongoDB with optimized settings');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Creates a query helper for pagination and filtering
 * @param {mongoose.Model} model - Mongoose model
 * @param {Object} query - Query parameters
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Query results with pagination metadata
 */
export const paginatedQuery = async (model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    select = '',
    populate = null,
    lean = true
  } = options;
  
  const skip = (page - 1) * limit;
  
  // Create base query
  let queryBuilder = model.find(query);
  
  // Apply pagination
  queryBuilder = queryBuilder.skip(skip).limit(limit);
  
  // Apply sorting
  queryBuilder = queryBuilder.sort(sort);
  
  // Apply field selection
  if (select) {
    queryBuilder = queryBuilder.select(select);
  }
  
  // Apply population
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(field => {
        queryBuilder = queryBuilder.populate(field);
      });
    } else {
      queryBuilder = queryBuilder.populate(populate);
    }
  }
  
  // Use lean for better performance when appropriate
  if (lean) {
    queryBuilder = queryBuilder.lean();
  }
  
  // Execute query with explain for debugging in development
  let results;
  if (process.env.NODE_ENV === 'development') {
    const explanation = await queryBuilder.explain();
    console.log('Query explanation:', JSON.stringify(explanation, null, 2));
    
    // Re-create query since explain consumes it
    queryBuilder = model.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort);
      
    if (select) queryBuilder = queryBuilder.select(select);
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(field => {
          queryBuilder = queryBuilder.populate(field);
        });
      } else {
        queryBuilder = queryBuilder.populate(populate);
      }
    }
    if (lean) queryBuilder = queryBuilder.lean();
    
    results = await queryBuilder;
  } else {
    results = await queryBuilder;
  }
  
  // Get total count for pagination
  const total = await model.countDocuments(query);
  
  return {
    results,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Optimizes bulk operations for better performance
 * @param {mongoose.Model} model - Mongoose model
 * @param {Array} operations - Array of operations
 * @param {Object} options - Bulk operation options
 * @returns {Promise<Object>} Result of bulk operation
 */
export const optimizedBulkOp = async (model, operations, options = {}) => {
  const { ordered = false } = options;
  
  if (!operations || operations.length === 0) {
    return { ok: 1, nModified: 0 };
  }
  
  const bulkOp = model.collection.initializeUnorderedBulkOp();
  
  operations.forEach(op => {
    if (op.insertOne) {
      bulkOp.insert(op.insertOne.document);
    } else if (op.updateOne) {
      bulkOp.find(op.updateOne.filter).updateOne(op.updateOne.update);
    } else if (op.updateMany) {
      bulkOp.find(op.updateMany.filter).update(op.updateMany.update);
    } else if (op.deleteOne) {
      bulkOp.find(op.deleteOne.filter).deleteOne();
    } else if (op.deleteMany) {
      bulkOp.find(op.deleteMany.filter).delete();
    } else if (op.replaceOne) {
      bulkOp.find(op.replaceOne.filter).replaceOne(op.replaceOne.replacement);
    }
  });
  
  try {
    return await bulkOp.execute();
  } catch (error) {
    console.error('Bulk operation error:', error);
    throw error;
  }
};

/**
 * Creates a query helper for aggregation pipelines with pagination
 * @param {mongoose.Model} model - Mongoose model
 * @param {Array} pipeline - Aggregation pipeline
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Aggregation results with pagination metadata
 */
export const paginatedAggregate = async (model, pipeline = [], options = {}) => {
  const {
    page = 1,
    limit = 10,
    countField = null
  } = options;
  
  const skip = (page - 1) * limit;
  
  // Create a copy of the pipeline for counting
  const countPipeline = [...pipeline];
  
  // Add pagination stages to the main pipeline
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });
  
  // Execute the main aggregation
  const results = await model.aggregate(pipeline);
  
  // Get total count for pagination
  let total;
  if (countField) {
    // If a count field is specified, use it from the results
    total = results.length > 0 ? results[0][countField] : 0;
  } else {
    // Otherwise, run a count aggregation
    countPipeline.push({ $count: 'total' });
    const countResult = await model.aggregate(countPipeline);
    total = countResult.length > 0 ? countResult[0].total : 0;
  }
  
  return {
    results,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Monitors database performance and logs slow queries
 * @param {number} thresholdMs - Threshold in milliseconds for slow query detection
 */
export const monitorDatabasePerformance = (thresholdMs = 100) => {
  mongoose.set('debug', (collectionName, method, query, doc, options) => {
    const start = Date.now();
    
    // Return a function to be called after the query completes
    return () => {
      const duration = Date.now() - start;
      
      if (duration > thresholdMs) {
        console.warn(`Slow query detected: ${collectionName}.${method} (${duration}ms)`);
        console.warn('Query:', JSON.stringify(query));
        console.warn('Options:', JSON.stringify(options));
      }
    };
  });
  
  console.log(`Database performance monitoring enabled (threshold: ${thresholdMs}ms)`);
};
