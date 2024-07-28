import React from 'react';
import { Page, Layout, Card, DataTable, Button } from '@shopify/polaris';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { json } from '@remix-run/node';
import prisma from '../../db.server';

export const loader = async () => {
  const campaigns = await prisma.campaign.findMany();
  return json({ campaigns });
};

const ManageCampaigns = () => {
  const { campaigns } = useLoaderData();
  const navigate = useNavigate();

  const rows = campaigns.map((campaign, index) => [
    campaign.name,
    campaign.impressions.toLocaleString(),
    campaign.clicks.toLocaleString(),
    `EGP ${campaign.spend.toLocaleString()}`,
    `EGP ${campaign.roas.toLocaleString()}`,
    <Button onClick={() => handleLaunch(index)}>{campaign.launch ? 'Pause' : 'Launch'}</Button>,
    <>
      <Button onClick={() => handleSuccess(index)}>Success</Button>
      <Button onClick={() => handleEnhance(index)}>Enhance</Button>
      <Button onClick={() => handleDelete(index)}>Delete</Button>
    </>
  ]);

  const handleLaunch = (index) => {
    const newCampaigns = [...campaigns];
    newCampaigns[index].launch = !newCampaigns[index].launch;
    setCampaigns(newCampaigns);
  };

  const handleSuccess = (index) => {
    const newCampaigns = [...campaigns];
    newCampaigns[index].status = 'success';
    setCampaigns(newCampaigns);
  };

  const handleEnhance = (index) => {
    console.log('Enhancing campaign:', index);
  };

  const handleDelete = (index) => {
    const newCampaigns = campaigns.filter((_, i) => i !== index);
    setCampaigns(newCampaigns);
  };

  return (
    <Page
      title="Manage Campaigns"
      primaryAction={{ content: 'Create New Campaign', onAction: () => navigate('/app/create-campaign') }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <DataTable
              columnContentTypes={['text', 'numeric', 'numeric', 'text', 'text', 'text']}
              headings={['Campaign Name', 'Impressions', 'Clicks', 'Spend', 'ROAS', 'Launch']}
              rows={rows}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default ManageCampaigns;
