import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51NxSampleTestKeyForDevelopmentOnly');

/**
 * Create a payment intent with Stripe
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (default: 'usd')
 * @param {Object} metadata - Additional metadata for the payment
 * @returns {Promise<Object>} - Stripe payment intent object
 */
export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      payment_method_types: ['card'],
    });
    
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Retrieve a payment intent from Stripe
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} - Stripe payment intent object
 */
export const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

/**
 * Capture a payment intent that has been authorized
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} - Stripe payment intent object
 */
export const capturePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error capturing payment intent:', error);
    throw error;
  }
};

/**
 * Cancel a payment intent
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} - Stripe payment intent object
 */
export const cancelPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error canceling payment intent:', error);
    throw error;
  }
};

/**
 * Create a refund for a payment
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {number} amount - Amount to refund in cents (if not provided, full amount is refunded)
 * @param {string} reason - Reason for refund ('requested_by_customer', 'duplicate', 'fraudulent')
 * @returns {Promise<Object>} - Stripe refund object
 */
export const createRefund = async (paymentIntentId, amount = null, reason = 'requested_by_customer') => {
  try {
    const refundParams = {
      payment_intent: paymentIntentId,
      reason
    };
    
    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }
    
    const refund = await stripe.refunds.create(refundParams);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
};

/**
 * Create a Stripe customer
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @returns {Promise<Object>} - Stripe customer object
 */
export const createCustomer = async (email, name) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name
    });
    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

/**
 * Add a payment method to a customer
 * @param {string} customerId - Stripe customer ID
 * @param {string} paymentMethodId - Stripe payment method ID
 * @returns {Promise<Object>} - Stripe payment method object
 */
export const attachPaymentMethod = async (customerId, paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    return paymentMethod;
  } catch (error) {
    console.error('Error attaching payment method:', error);
    throw error;
  }
};

/**
 * Create a checkout session for a one-time payment
 * @param {number} amount - Amount in dollars
 * @param {string} currency - Currency code (default: 'usd')
 * @param {string} successUrl - URL to redirect to on successful payment
 * @param {string} cancelUrl - URL to redirect to on canceled payment
 * @param {Object} metadata - Additional metadata for the session
 * @returns {Promise<Object>} - Stripe checkout session object
 */
export const createCheckoutSession = async (amount, currency = 'usd', successUrl, cancelUrl, metadata = {}) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Marketplace Purchase',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Retrieve a checkout session
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise<Object>} - Stripe checkout session object
 */
export const retrieveCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
};

/**
 * Format amount for display
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (default: 'usd')
 * @returns {string} - Formatted amount string
 */
export const formatAmountForDisplay = (amount, currency = 'usd') => {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  return numberFormat.format(amount);
};

/**
 * Format amount for Stripe
 * @param {number} amount - Amount in dollars
 * @returns {number} - Amount in cents
 */
export const formatAmountForStripe = (amount) => {
  return Math.round(amount * 100);
};
