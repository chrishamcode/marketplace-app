// Photo to Post AI Feature
import * as tf from '@tensorflow/tfjs-node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import { nanoid } from 'nanoid';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'your-api-key');

// Load COCO-SSD model for object detection
let model;
async function loadModel() {
  if (!model) {
    model = await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1', { fromTFHub: true });
  }
  return model;
}

// Process image and detect objects
export async function processImage(imageBuffer) {
  try {
    // Convert image to tensor
    const image = tf.node.decodeImage(imageBuffer);
    const model = await loadModel();
    
    // Run inference
    const predictions = await model.executeAsync(tf.expandDims(image));
    
    // Process results
    const boxes = predictions[1].arraySync()[0];
    const scores = predictions[2].arraySync()[0];
    const classes = predictions[0].arraySync()[0];
    const classNames = await getClassNames();
    
    // Filter results with confidence > 0.5
    const detectedObjects = [];
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] > 0.5) {
        const classId = classes[i];
        const className = classNames[classId] || 'unknown';
        const box = boxes[i];
        
        // Normalize box coordinates
        const normalizedBox = {
          yMin: box[0],
          xMin: box[1],
          yMax: box[2],
          xMax: box[3]
        };
        
        // Get image dimensions
        const { width, height } = await sharp(imageBuffer).metadata();
        
        // Convert normalized coordinates to pixel coordinates
        const pixelBox = {
          yMin: Math.round(normalizedBox.yMin * height),
          xMin: Math.round(normalizedBox.xMin * width),
          yMax: Math.round(normalizedBox.yMax * height),
          xMax: Math.round(normalizedBox.xMax * width)
        };
        
        // Crop image to object
        const croppedImageBuffer = await cropImage(imageBuffer, pixelBox);
        
        // Assess condition
        const conditionData = await assessCondition(croppedImageBuffer);
        
        // Recognize brand
        const brand = await recognizeBrand(croppedImageBuffer, className);
        
        // Detect features
        const features = await detectFeatures(croppedImageBuffer, className);
        
        // Estimate price
        const priceData = await estimatePrice(className, conditionData.condition, brand, {
          clarity: conditionData.conditionDetails?.clarity || 70,
          scratches: conditionData.conditionDetails?.scratches || 70,
          wearMarks: conditionData.conditionDetails?.wearMarks || 70,
          category: features.category,
          features: features.detectedFeatures,
          materials: features.materials
        });
        
        // Generate title and description
        const contentData = await generateContent(className, brand, conditionData.condition, features);
        
        detectedObjects.push({
          itemIndex: i,
          className,
          confidence: scores[i],
          box: pixelBox,
          processedImageBuffer: croppedImageBuffer,
          condition: conditionData.condition,
          conditionScore: conditionData.conditionScore,
          conditionDetails: conditionData.conditionDetails,
          brand,
          features,
          price: priceData.price,
          priceExplanation: priceData.explanation,
          priceConfidence: priceData.confidence,
          title: contentData.title,
          description: contentData.description,
          category: features.category,
          subcategory: features.subcategory
        });
      }
    }
    
    return {
      success: true,
      detectedObjects,
      imageWidth: image.shape[1],
      imageHeight: image.shape[0]
    };
    
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Crop image to object
async function cropImage(imageBuffer, box) {
  try {
    const width = box.xMax - box.xMin;
    const height = box.yMax - box.yMin;
    
    // Add padding
    const paddingX = Math.round(width * 0.1);
    const paddingY = Math.round(height * 0.1);
    
    const croppedImage = await sharp(imageBuffer)
      .extract({
        left: Math.max(0, box.xMin - paddingX),
        top: Math.max(0, box.yMin - paddingY),
        width: Math.min(width + (paddingX * 2), (await sharp(imageBuffer).metadata()).width - box.xMin + paddingX),
        height: Math.min(height + (paddingY * 2), (await sharp(imageBuffer).metadata()).height - box.yMin + paddingY)
      })
      .toBuffer();
    
    return croppedImage;
  } catch (error) {
    console.error('Error cropping image:', error);
    return imageBuffer;
  }
}

// Assess condition
async function assessCondition(imageBuffer) {
  try {
    // Analyze image quality
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;
    
    // Simplified condition assessment for MVP
    // In a real implementation, this would use more sophisticated image analysis
    const clarity = 80; // Placeholder value
    const scratches = 75; // Placeholder value
    const wearMarks = 70; // Placeholder value
    
    // Calculate condition score
    const conditionScore = (clarity * 0.4) + (scratches * 0.3) + (wearMarks * 0.3);
    
    // Map score to condition
    const condition = mapScoreToCondition(conditionScore);
    
    return {
      condition,
      conditionScore,
      conditionDetails: {
        clarity,
        scratches,
        wearMarks
      }
    };
  } catch (error) {
    console.error('Error assessing condition:', error);
    return { condition: 'good', conditionScore: 50 };
  }
}

// Map condition score to condition categories
function mapScoreToCondition(score) {
  if (score >= 95) return 'new_in_box';
  if (score >= 90) return 'new';
  if (score >= 80) return 'like_new';
  if (score >= 70) return 'excellent';
  if (score >= 60) return 'very_good';
  if (score >= 50) return 'good';
  if (score >= 40) return 'fair';
  if (score >= 30) return 'acceptable';
  if (score >= 20) return 'poor';
  return 'salvage';
}

// Recognize brand (simplified for MVP)
async function recognizeBrand(imageBuffer, objectName) {
  // In a real implementation, this would use logo detection and OCR
  // For MVP, we'll return a placeholder value
  const commonBrands = {
    'cell phone': ['Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus'],
    'laptop': ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus'],
    'television': ['Samsung', 'LG', 'Sony', 'TCL', 'Vizio'],
    'chair': ['IKEA', 'Herman Miller', 'Steelcase', 'West Elm', 'Wayfair'],
    'sofa': ['IKEA', 'Ashley Furniture', 'La-Z-Boy', 'Crate & Barrel', 'West Elm'],
    'book': ['Penguin', 'Random House', 'HarperCollins', 'Simon & Schuster', 'Macmillan'],
    'watch': ['Rolex', 'Casio', 'Seiko', 'Timex', 'Fossil'],
    'handbag': ['Coach', 'Michael Kors', 'Louis Vuitton', 'Kate Spade', 'Gucci']
  };
  
  // Find closest object category
  let closestCategory = 'unknown';
  let highestSimilarity = 0;
  
  for (const category in commonBrands) {
    const similarity = calculateStringSimilarity(objectName.toLowerCase(), category);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      closestCategory = category;
    }
  }
  
  // If we have brands for this category, randomly select one
  if (commonBrands[closestCategory]) {
    const brands = commonBrands[closestCategory];
    return brands[Math.floor(Math.random() * brands.length)];
  }
  
  return 'unknown';
}

// Detect features (simplified for MVP)
async function detectFeatures(imageBuffer, objectName) {
  // In a real implementation, this would use more sophisticated image analysis
  // For MVP, we'll return placeholder values based on object name
  
  // Map object to category and subcategory
  const categoryMap = {
    'cell phone': { category: 'Electronics', subcategory: 'Smartphones' },
    'laptop': { category: 'Electronics', subcategory: 'Computers' },
    'television': { category: 'Electronics', subcategory: 'TVs' },
    'chair': { category: 'Furniture', subcategory: 'Seating' },
    'sofa': { category: 'Furniture', subcategory: 'Seating' },
    'book': { category: 'Media', subcategory: 'Books' },
    'watch': { category: 'Fashion', subcategory: 'Accessories' },
    'handbag': { category: 'Fashion', subcategory: 'Bags' }
  };
  
  // Find closest object category
  let closestCategory = 'unknown';
  let highestSimilarity = 0;
  
  for (const category in categoryMap) {
    const similarity = calculateStringSimilarity(objectName.toLowerCase(), category);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      closestCategory = category;
    }
  }
  
  // Get category and subcategory
  const category = categoryMap[closestCategory]?.category || 'Other';
  const subcategory = categoryMap[closestCategory]?.subcategory || '';
  
  // Placeholder feature detection
  return {
    category,
    subcategory,
    colors: ['black', 'white', 'gray'],
    materials: ['plastic', 'metal'],
    detectedFeatures: ['portable', 'lightweight']
  };
}

// Estimate price (simplified for MVP)
async function estimatePrice(objectName, condition, brand, additionalDetails) {
  try {
    // Base prices for common categories
    const basePrices = {
      'smartphone': 300,
      'cell phone': 300,
      'laptop': 500,
      'tablet': 200,
      'camera': 250,
      'headphones': 80,
      'speaker': 100,
      'watch': 150,
      'jewelry': 200,
      'clothing': 40,
      'shoes': 60,
      'furniture': 200,
      'chair': 100,
      'sofa': 300,
      'book': 15,
      'toy': 25,
      'tool': 50,
      'kitchenware': 30,
      'artwork': 100,
      'bicycle': 150,
      'musical instrument': 200
    };
    
    // Find the closest category
    let closestCategory = 'other';
    let highestSimilarity = 0;
    
    for (const category in basePrices) {
      const similarity = calculateStringSimilarity(objectName.toLowerCase(), category);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        closestCategory = category;
      }
    }
    
    // Get base price for the category
    let basePrice = basePrices[closestCategory] || 50;
    
    // Adjust for condition
    const conditionMultipliers = {
      'new_in_box': 1.0,
      'new': 0.9,
      'like_new': 0.8,
      'excellent': 0.7,
      'very_good': 0.6,
      'good': 0.5,
      'fair': 0.4,
      'acceptable': 0.3,
      'poor': 0.2,
      'salvage': 0.1
    };
    
    const conditionMultiplier = conditionMultipliers[condition] || 0.5;
    
    // Adjust for brand recognition
    const brandMultiplier = (brand !== 'unknown') ? 1.2 : 1.0;
    
    // Calculate final price
    const price = Math.round(basePrice * conditionMultiplier * brandMultiplier);
    
    // Determine confidence level
    let confidence = 'medium';
    if (highestSimilarity > 0.8 && brand !== 'unknown') {
      confidence = 'high';
    } else if (highestSimilarity < 0.5 || condition === 'unknown') {
      confidence = 'low';
    }
    
    return {
      price,
      explanation: `Estimated based on ${condition} condition ${brand !== 'unknown' ? brand + ' ' : ''}${objectName}.`,
      confidence
    };
  } catch (error) {
    console.error('Error estimating price:', error);
    return {
      price: 50,
      explanation: "Estimated based on general market trends for similar items.",
      confidence: "low"
    };
  }
}

// Generate title and description
async function generateContent(objectName, brand, condition, features) {
  try {
    // Format condition for display
    const formattedCondition = condition
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Generate title
    let title = '';
    if (brand !== 'unknown') {
      title += brand + ' ';
    }
    title += objectName.charAt(0).toUpperCase() + objectName.slice(1);
    if (features.colors && features.colors.length > 0) {
      title += ` - ${features.colors[0].charAt(0).toUpperCase() + features.colors[0].slice(1)}`;
    }
    
    // Generate description
    let description = `${formattedCondition} condition ${brand !== 'unknown' ? brand + ' ' : ''}${objectName}. `;
    
    // Add features
    if (features.detectedFeatures && features.detectedFeatures.length > 0) {
      description += `Features include: ${features.detectedFeatures.join(', ')}. `;
    }
    
    // Add materials
    if (features.materials && features.materials.length > 0) {
      description += `Made of ${features.materials.join(' and ')}. `;
    }
    
    // Add colors
    if (features.colors && features.colors.length > 0) {
      description += `Color: ${features.colors.join(', ')}. `;
    }
    
    // Add generic closing
    description += 'Please contact me with any questions.';
    
    return {
      title,
      description
    };
  } catch (error) {
    console.error('Error generating content:', error);
    return {
      title: `${objectName.charAt(0).toUpperCase() + objectName.slice(1)} for Sale`,
      description: `${objectName} in ${condition.replace(/_/g, ' ')} condition. Please contact me with any questions.`
    };
  }
}

// Get class names for COCO-SSD model
async function getClassNames() {
  return [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
    'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog',
    'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella',
    'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
    'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
    'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich',
    'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
    'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote',
    'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book',
    'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
  ];
}

// Calculate string similarity (Levenshtein distance)
function calculateStringSimilarity(str1, str2) {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  
  const distance = track[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  
  return maxLength > 0 ? 1 - (distance / maxLength) : 1;
}
