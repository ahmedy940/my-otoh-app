import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}

// Fetch campaigns with filtering and pagination
export const getCampaigns = async ({ filters, pagination, shop }) => {
  const { name, impressions, clicks, roas, status } = filters;
  const { currentPage, pageSize } = pagination;

  const where = {
    shop,  // Ensure campaigns are filtered by shop
    name: name ? { contains: name } : undefined,
    impressions: impressions ? { equals: Number(impressions) } : undefined,
    clicks: clicks ? { equals: Number(clicks) } : undefined,
    roas: roas ? { equals: Number(roas) } : undefined,
    status: status ? { equals: status } : undefined,
  };

  const campaigns = await prisma.campaign.findMany({
    where,
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });

  const totalItems = await prisma.campaign.count({ where });
  return { campaigns, totalItems };
};

// Create a new campaign (handling DRAFT and ACTIVE statuses)
export const createCampaign = async (data) => {
  const { name, impressions, clicks, spend, roas, status, shop, startDate, endDate } = data;

  // Validation: Ensure necessary fields are present
  if (!name || !startDate || !status || !shop) {
    throw new Error("Missing required fields");
  }

  const newCampaign = await prisma.campaign.create({
    data: {
      shop,
      name,
      impressions: impressions ? Number(impressions) : 0,
      clicks: clicks ? Number(clicks) : 0,
      spend: spend ? Number(spend) : 0,
      roas: roas ? Number(roas) : 0,
      status: status || "DRAFT",  // Default to DRAFT if no status is provided
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return newCampaign;
};


// Delete a campaign by ID
export const deleteCampaign = async (campaignId) => {
  await prisma.campaign.delete({ where: { id: campaignId } });
};

// Export campaigns for Excel (filtered, no pagination)
export const exportCampaignsToExcel = async (filters) => {
  const { name, impressions, clicks, roas, status } = filters;

  // Apply the same filters as getCampaigns but without pagination
  const where = {
    name: name ? { contains: name } : undefined,
    impressions: impressions ? { equals: Number(impressions) } : undefined,
    clicks: clicks ? { equals: Number(clicks) } : undefined,
    roas: roas ? { equals: Number(roas) } : undefined,
    status: status ? { equals: status } : undefined,
  };

  const campaigns = await prisma.campaign.findMany({
    where,
  });

  return campaigns;
};

export const createAdSet = async (campaignId, data) => {
  const { audience, placements, budget, startDate, endDate } = data;

  const newAdSet = await prisma.adSet.create({
    data: {
      campaignId,
      audience,
      placements,
      budget: Number(budget),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return newAdSet;
};

export const createCreative = async (adSetId, data) => {
  const { type, content } = data;

  const newCreative = await prisma.creative.create({
    data: {
      adSetId,
      type,
      content,
    },
  });

  return newCreative;
};

export const updateCampaign = async (campaignId, data) => {
  const { name, objective, budget, startDate, endDate, status } = data;

  const updatedCampaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      name,
      objective,
      budget: Number(budget),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status,
    },
  });

  return updatedCampaign;
};

export const getCampaignsWithDetails = async (filters, pagination, shop) => {
  const { name, status } = filters;
  const { currentPage, pageSize } = pagination;

  const where = {
    shop,
    name: name ? { contains: name } : undefined,
    status: status ? { equals: status } : undefined,
  };

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      adSets: {
        include: {
          creatives: true,  // Include creatives in ad sets
        },
      },
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });

  const totalItems = await prisma.campaign.count({ where });
  return { campaigns, totalItems };
};

// Remove a campaign by ID (wrapper for deleteCampaign for naming consistency)
export const removeCampaign = async (campaignId) => {
  try {
    // Deleting the campaign with the provided ID
    await prisma.campaign.delete({ where: { id: campaignId } });
    console.log(`Campaign with ID ${campaignId} removed successfully.`);
  } catch (error) {
    console.error(`Error removing campaign with ID ${campaignId}:`, error);
    throw new Error('Failed to remove campaign.');
  }
};

// Export default prisma for use elsewhere
export default prisma;
