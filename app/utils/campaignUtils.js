// Utility Functions (campaignUtils.js)
import prisma from "../db.server"; // Import Prisma client
import { removeCampaign as dbRemoveCampaign } from "../db.server"; // Import removeCampaign function from db.server

// Fetch campaigns from the backend
export const getCampaignsFromBackend = async (fetchWithAuth, filters, pagination, setLoading, setFilteredCampaigns, setPagination) => {
  try {
    console.log('Fetching campaigns with filters:', filters, 'and pagination:', pagination); // Log the filters and pagination used
    setLoading(true); // Set loading state to true before starting the data fetch

    // Construct query parameters from filters and pagination
    const queryParams = new URLSearchParams({
      name: filters.name,
      impressions: filters.impressions,
      clicks: filters.clicks,
      roas: filters.roas,
      status: filters.status,
      page: pagination.currentPage,
      size: pagination.pageSize,
    }).toString();

    let retries = 3; // Number of retry attempts in case of failure
    let delay = 1000; // Initial delay between retries in milliseconds
    while (retries > 0) {
      try {
        console.log(`Attempting to fetch campaigns. Retries left: ${retries}`); // Log the number of retries left
        const response = await fetchWithAuth(`/app/manage-campaigns?${queryParams}`); // Perform authenticated fetch request

        // Handle specific HTTP response statuses
        if (response.status === 429) {
          console.warn('Rate limit exceeded, retrying...'); // Log rate limit warning
          throw new Error('Rate limit exceeded, retrying...'); // Handle rate limit errors with retry
        } else if (response.status === 401) {
          console.error('Unauthorized access, please check your credentials'); // Log unauthorized access error
          throw new Error('Unauthorized access, please check your credentials'); // Handle unauthorized errors
        } else if (!response.ok) {
          console.error('Failed to fetch campaigns with status:', response.status); // Log non-successful response status
          throw new Error('Failed to fetch campaigns'); // Handle other non-successful responses
        }

        const data = await response.json(); // Parse response data as JSON
        console.log('Campaigns fetched successfully:', data); // Log the successfully fetched data
        setFilteredCampaigns(data.campaigns); // Update state with fetched campaigns
        setPagination((prev) => ({ ...prev, totalItems: data.totalItems })); // Update pagination information
        break; // Exit loop if the request is successful
      } catch (error) {
        console.error('Error fetching campaigns:', error); // Log the error for debugging
        retries -= 1; // Decrement retry count
        if (retries === 0) {
          console.error('All retry attempts failed'); // Log failure after exhausting retries
        } else {
          console.log(`Retrying in ${delay}ms...`); // Log the delay before retrying
          await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
          delay *= 2; // Exponential backoff to increase delay between retries
        }
      }
    }
  } finally {
    setLoading(false); // Set loading state to false after completing the fetch (successful or not)
    console.log('Loading state set to false'); // Log loading state change
  }
};

// Create a new campaign in the database
export const createNewCampaign = async (data) => {
  console.log('Creating a new campaign with data:', data); // Log the data used to create a new campaign
  const { name, impressions, clicks, spend, roas, status, shop, startDate, endDate } = data;

  // Create a new campaign record in the database
  try {
    const newCampaign = await prisma.campaign.create({
      data: {
        shop,
        name,
        impressions: impressions ? Number(impressions) : 0, // Ensure impressions is stored as a number
        clicks: clicks ? Number(clicks) : 0, // Ensure clicks is stored as a number
        spend: spend ? Number(spend) : 0, // Ensure spend is stored as a number
        roas: roas ? Number(roas) : 0, // Ensure ROAS is stored as a number
        status,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    console.log('New campaign created successfully:', newCampaign); // Log the newly created campaign
    return newCampaign; // Return the newly created campaign
  } catch (error) {
    console.error('Error creating new campaign:', error); // Log any error that occurs during creation
    throw error; // Re-throw the error for further handling
  }
};

// Remove a campaign from the database
export const removeCampaign = async (campaignId) => {
  console.log(`Attempting to delete campaign with ID: ${campaignId}`); // Log the ID of the campaign to be deleted
  try {
    await dbRemoveCampaign(campaignId); // Use the removeCampaign function from db.server.js
    console.log(`Campaign with ID: ${campaignId} deleted successfully`); // Log successful deletion
  } catch (error) {
    console.error(`Error deleting campaign with ID ${campaignId}:`, error); // Log an error if the campaign does not exist or deletion fails
    throw new Error('Failed to remove campaign.'); // Re-throw error to notify the caller
  }
};
