import { json } from '@remix-run/node';
import { getCampaigns, deleteCampaign } from '../../shopify.server.js';

export async function loader({ request }) {
  try {
    const url = new URL(request.url);  // Extract URL for query parameters

    // Fetch filters and pagination from the URL query parameters
    const filters = {
      name: url.searchParams.get('name') || '',
      impressions: url.searchParams.get('impressions') || '',
      clicks: url.searchParams.get('clicks') || '',
      roas: url.searchParams.get('roas') || '',
      status: url.searchParams.get('status') || '',
    };

    const pagination = {
      currentPage: Math.max(1, Number(url.searchParams.get('page')) || 1),
      pageSize: Math.min(Math.max(1, Number(url.searchParams.get('size')) || 10), 100),
    };

    // Try fetching campaigns from the database
    const { campaigns, totalItems } = await getCampaigns({
      filters,
      pagination,
    });

    // Return the fetched campaigns and total items
    return json({ campaigns, totalItems });

  } catch (error) {
    // Handle errors related to fetching data
    console.error('Error fetching campaigns:', error);
    return json({ error: 'Error fetching campaigns' }, { status: 500 });
  }
}

export async function action({ request }) {
  const formData = await request.formData();
  const actionType = formData.get('_action');

  if (actionType === 'delete') {
    const campaignId = parseInt(formData.get('campaignId'), 10);
    try {
      await deleteCampaign(campaignId);
      return json({ success: true });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return json({ success: false, message: 'Error deleting campaign.' }, { status: 500 });
    }
  }

  return json({ message: 'Invalid action.' }, { status: 400 });
}
