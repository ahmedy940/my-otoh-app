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
  createMetaCampaign,
  getCampaignStats,
  updateMetaCampaign
} from '../app/metaAdsIntegration';
import {
  createNewCampaign,
  removeCampaign,
  getCampaignsFromBackend
} from '../app/utils/campaignUtils';

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

// Use imported functions for managing Meta campaigns
export const createCampaign = createMetaCampaign;
export const getCampaigns = getCampaignStats;
export const updateCampaign = updateMetaCampaign;

// Campaign management functions (from campaignUtils.js)
export const createNewCampaignInShopify = createNewCampaign; // Create a new campaign in Shopify database
export const removeCampaignInShopify = removeCampaign; // Remove a campaign by ID
export const fetchCampaignsFromBackend = getCampaignsFromBackend; // Fetch campaigns with filters and pagination

