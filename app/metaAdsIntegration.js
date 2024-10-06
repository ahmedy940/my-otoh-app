import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "../app/db.server.js";
import {
  createNewCampaign,
  removeCampaign,
  getCampaignsFromBackend
} from '../app/utils/campaignUtils';
import {
  createCampaign as createMetaCampaign,
  getCampaign,
  updateCampaign as updateMetaCampaign
} from '../app/metaAdsIntegration';

// Import the Facebook SDK using ES Modules
import { FacebookAdsApi, AdAccount, Campaign } from 'facebook-nodejs-business-sdk';

// Initialize the Facebook SDK
const accessToken = process.env.FACEBOOK_ACCESS_TOKEN || 'your-long-lived-access-token';
const api = FacebookAdsApi.init(accessToken);
const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID || 'your-ad-account-id';
const adAccount = new AdAccount(adAccountId);

// Initialize Shopify App
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.April24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
    v3_lineItemBilling: true,
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.April24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage; // Make sure you export sessionStorage

// Export the Facebook SDK components for use in your app
export const facebookApi = api;
export const facebookAdAccount = adAccount;
export const facebookCampaign = Campaign;

// Shopify Campaign Management Functions (from campaignUtils.js)
export const createNewCampaignInShopify = async (data) => {
  console.log('Creating new Shopify campaign:', data);
  try {
    const newCampaign = await createNewCampaign(data);
    console.log('New Shopify campaign created successfully:', newCampaign);
    return newCampaign;
  } catch (error) {
    console.error('Error creating Shopify campaign:', error);
    throw error;
  }
};

export const removeCampaignInShopify = async (campaignId) => {
  console.log(`Removing Shopify campaign with ID: ${campaignId}`);
  try {
    await removeCampaign(campaignId);
    console.log(`Shopify campaign with ID ${campaignId} removed successfully.`);
  } catch (error) {
    console.error(`Error removing Shopify campaign with ID ${campaignId}:`, error);
    throw error;
  }
};

export const fetchCampaignsFromBackend = getCampaignsFromBackend; // Fetch campaigns with filters and pagination

// Meta Ads Campaign Management Functions (from metaAdsIntegration.js)
export const createMetaCampaignInFacebook = async (campaignData) => {
  console.log('Creating new Meta campaign in Facebook:', campaignData);
  try {
    const newCampaign = await createMetaCampaign(accessToken, campaignData);
    console.log('New Meta campaign created successfully:', newCampaign);
    return newCampaign;
  } catch (error) {
    console.error('Error creating Meta campaign in Facebook:', error);
    throw error;
  }
};

export const getMetaCampaignInFacebook = async (campaignId) => {
  console.log(`Fetching Meta campaign with ID: ${campaignId}`);
  try {
    const campaign = await getCampaign(accessToken, campaignId);
    console.log('Meta campaign fetched successfully:', campaign);
    return campaign;
  } catch (error) {
    console.error(`Error fetching Meta campaign with ID ${campaignId}:`, error);
    throw error;
  }
};

export const updateMetaCampaignInFacebook = async (campaignId, updatedData) => {
  console.log(`Updating Meta campaign with ID: ${campaignId}`);
  try {
    const updatedCampaign = await updateMetaCampaign(accessToken, campaignId, updatedData);
    console.log('Meta campaign updated successfully:', updatedCampaign);
    return updatedCampaign;
  } catch (error) {
    console.error(`Error updating Meta campaign with ID ${campaignId}:`, error);
    throw error;
  }
};
