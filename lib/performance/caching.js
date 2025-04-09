import Redis from 'redis';
import { promisify } from 'util';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

/**
 * Redis client for caching
 */
let redisClient;

/**
 * Initializes Redis client for caching
 * @returns {Object} Redis client with promisified methods
 */
export const initializeCache = () => {
  if (redisClient) {
    return redisClient;
  }
  
  const client = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        // Exponential backoff with max delay of 10 seconds
        return Math.min(retries * 50, 10000);
      }
    }
  });
  
  client.on('error', (err) => {
    console.error('Redis client error:', err);
  });
  
  client.on('connect', () => {
    console.log('Connected to Redis server');
  });
  
  // Promisify Redis methods
  const getAsync = promisify(client.get).bind(client);
  const setAsync = promisify(client.set).bind(client);
  const delAsync = promisify(client.del).bind(client);
  const flushAsync = promisify(client.flushall).bind(client);
  const expireAsync = promisify(client.expire).bind(client);
  
  redisClient = {
    client,
    getAsync,
    setAsync,
    delAsync,
    flushAsync,
    expireAsync
  };
  
  return redisClient;
};

/**
 * Caches API responses
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} Middleware function for caching
 */
export const cacheApiResponse = (duration = 60) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    try {
      const cache = initializeCache();
      const cacheKey = `api:${req.url}`;
      
      // Try to get cached response
      const cachedResponse = await cache.getAsync(cacheKey);
      
      if (cachedResponse) {
        const data = JSON.parse(cachedResponse);
        return NextResponse.json(data, { status: 200 });
      }
      
      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache the response
      res.json = (data) => {
        // Cache the response
        cache.setAsync(cacheKey, JSON.stringify(data));
        cache.expireAsync(cacheKey, duration);
        
        // Call original json method
        return originalJson.call(res, data);
      };
      
      return next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      return next();
    }
  };
};

/**
 * Clears cache for specific keys
 * @param {string|Array} keys - Cache keys to clear
 */
export const clearCache = async (keys) => {
  try {
    const cache = initializeCache();
    
    if (Array.isArray(keys)) {
      for (const key of keys) {
        await cache.delAsync(key);
      }
    } else {
      await cache.delAsync(keys);
    }
    
    console.log('Cache cleared for keys:', keys);
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};

/**
 * Optimizes images for better performance
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Optimization options
 * @returns {Promise<Buffer>} Optimized image buffer
 */
export const optimizeImage = async (imageBuffer, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp'
  } = options;
  
  try {
    let sharpInstance = sharp(imageBuffer);
    
    // Resize if dimensions are provided
    if (width || height) {
      sharpInstance = sharpInstance.resize({
        width,
        height,
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Convert to specified format
    switch (format.toLowerCase()) {
      case 'webp':
        return await sharpInstance.webp({ quality }).toBuffer();
      case 'jpeg':
      case 'jpg':
        return await sharpInstance.jpeg({ quality }).toBuffer();
      case 'png':
        return await sharpInstance.png({ quality }).toBuffer();
      case 'avif':
        return await sharpInstance.avif({ quality }).toBuffer();
      default:
        return await sharpInstance.webp({ quality }).toBuffer();
    }
  } catch (error) {
    console.error('Image optimization error:', error);
    return imageBuffer; // Return original buffer on error
  }
};

/**
 * Generates responsive image variants
 * @param {string} imagePath - Path to the original image
 * @param {Array} sizes - Array of sizes to generate
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Object with paths to responsive images
 */
export const generateResponsiveImages = async (imagePath, sizes = [640, 768, 1024, 1280], options = {}) => {
  const {
    outputDir = path.dirname(imagePath),
    quality = 80,
    format = 'webp'
  } = options;
  
  try {
    const filename = path.basename(imagePath, path.extname(imagePath));
    const imageBuffer = fs.readFileSync(imagePath);
    const results = {};
    
    // Generate images for each size
    for (const width of sizes) {
      const outputFilename = `${filename}-${width}.${format}`;
      const outputPath = path.join(outputDir, outputFilename);
      
      const optimizedBuffer = await optimizeImage(imageBuffer, {
        width,
        quality,
        format
      });
      
      fs.writeFileSync(outputPath, optimizedBuffer);
      results[width] = outputPath;
    }
    
    return results;
  } catch (error) {
    console.error('Responsive image generation error:', error);
    throw error;
  }
};

/**
 * Middleware for browser caching
 * @param {number} maxAge - Max age in seconds
 * @returns {Function} Middleware function for browser caching
 */
export const browserCache = (maxAge = 86400) => { // Default: 1 day
  return (req, res, next) => {
    // Set cache control headers
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    
    // Set expires header
    const expiresDate = new Date();
    expiresDate.setSeconds(expiresDate.getSeconds() + maxAge);
    res.setHeader('Expires', expiresDate.toUTCString());
    
    return next();
  };
};

/**
 * Middleware for static asset caching
 * @returns {Function} Middleware function for static asset caching
 */
export const staticAssetCache = () => {
  return (req, res, next) => {
    const url = req.url;
    
    // Cache static assets for 1 year
    if (url.match(/\.(css|js|woff2|woff|ttf|svg|png|jpg|jpeg|gif|ico|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      
      // Set expires header (1 year)
      const expiresDate = new Date();
      expiresDate.setFullYear(expiresDate.getFullYear() + 1);
      res.setHeader('Expires', expiresDate.toUTCString());
    }
    
    return next();
  };
};

/**
 * In-memory cache for quick access to frequently used data
 */
const memoryCache = new Map();

/**
 * Gets data from in-memory cache
 * @param {string} key - Cache key
 * @returns {*} Cached data or undefined
 */
export const getFromMemoryCache = (key) => {
  const item = memoryCache.get(key);
  
  if (!item) {
    return undefined;
  }
  
  // Check if item has expired
  if (item.expiry && item.expiry < Date.now()) {
    memoryCache.delete(key);
    return undefined;
  }
  
  return item.value;
};

/**
 * Sets data in in-memory cache
 * @param {string} key - Cache key
 * @param {*} value - Data to cache
 * @param {number} ttl - Time to live in seconds
 */
export const setInMemoryCache = (key, value, ttl = 60) => {
  const expiry = ttl > 0 ? Date.now() + (ttl * 1000) : null;
  
  memoryCache.set(key, {
    value,
    expiry
  });
};

/**
 * Clears in-memory cache
 * @param {string} key - Specific key to clear, or all if not provided
 */
export const clearMemoryCache = (key) => {
  if (key) {
    memoryCache.delete(key);
  } else {
    memoryCache.clear();
  }
};

/**
 * Middleware for response compression
 * @returns {Function} Middleware function for compression
 */
export const compressResponse = () => {
  return (req, res, next) => {
    // Import compression dynamically to avoid server-side issues
    import('compression').then(({ default: compression }) => {
      compression()(req, res, next);
    }).catch(error => {
      console.error('Compression middleware error:', error);
      next();
    });
  };
};
