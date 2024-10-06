import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add some sample campaigns linked to a specific shop
  const campaign1 = await prisma.campaign.create({
    data: {
      name: 'Sample Campaign 1',
      impressions: 5000,
      clicks: 400,
      spend: 1200.5,
      roas: 2.4,
      status: 'active',
      objective: 'Increase Sales',  // New field - objective
      budget: 3000.0,  // New field - budget
      startDate: new Date('2024-10-01'),  // New field - startDate
      endDate: new Date('2024-12-01'),  // New field - endDate
      shop: 'quickstart-47141311.myshopify.com', // Replace with the actual store identifier
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      name: 'Sample Campaign 2',
      impressions: 10000,
      clicks: 800,
      spend: 2200.0,
      roas: 3.0,
      status: 'paused',
      objective: 'Brand Awareness',  // New field - objective
      budget: 5000.0,  // New field - budget
      startDate: new Date('2024-09-01'),  // New field - startDate
      endDate: new Date('2024-11-30'),  // New field - endDate
      shop: 'quickstart-47141311.myshopify.com', // Replace with the actual store identifier
    },
  });

  console.log({ campaign1, campaign2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
