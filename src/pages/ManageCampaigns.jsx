import { Page, Card, DataTable, Button } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';

function ManageCampaigns() {
  const navigate = useNavigate();

  const rows = [
    // Example rows
    ['Campaign 1', '1000', '150', '$200', '1.5'],
  ];

  return (
    <Page title="Manage Campaigns">
      <Card>
        <DataTable
          columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'numeric']}
          headings={['Campaign Name', 'Impressions', 'Clicks', 'Spend', 'ROAS']}
          rows={rows}
        />
      </Card>
      <Button primary onClick={() => navigate('/app/create-campaign')}>
        Create your first campaign
      </Button>
    </Page>
  );
}

export default ManageCampaigns;
