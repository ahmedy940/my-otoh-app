// app/routes/create-campaign/route.jsx
import { json } from '@remix-run/node';
import { createNewCampaign } from '../../db.server.js';

export async function action({ request }) {
  const formData = await request.formData();
  const campaignData = {
    name: formData.get('name'),
    objective: formData.get('objective'),
    budget: parseFloat(formData.get('budget')),
    startDate: formData.get('start_date'),
    endDate: formData.get('end_date'),
    status: 'DRAFT' // Default status
  };

  // Validation logic here
  if (!campaignData.name || !campaignData.objective || isNaN(campaignData.budget)) {
    return json({ error: 'Invalid input data' }, { status: 400 });
  }

  try {
    const campaign = await createNewCampaign(campaignData);
    return json({ campaign });
  } catch (error) {
    console.error(error);
    return json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
