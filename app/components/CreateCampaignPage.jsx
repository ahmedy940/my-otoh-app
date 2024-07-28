import React, { useState } from 'react';
import { Page, Layout, FormLayout, TextField, Button, DatePicker } from '@shopify/polaris';
import { useNavigate } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import prisma from '../db.server';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const campaignData = {
    name: formData.get('name'),
    impressions: parseInt(formData.get('impressions')),
    clicks: parseInt(formData.get('clicks')),
    spend: parseFloat(formData.get('spend')),
    roas: parseFloat(formData.get('roas')),
    launch: formData.get('launch') === 'on',
  };

  await prisma.campaign.create({ data: campaignData });
  return redirect('/app/manage-campaigns');
};

const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState({
    name: '',
    impressions: '',
    clicks: '',
    spend: '',
    roas: '',
    launch: false,
  });

  const handleChange = (field) => (value) => {
    setCampaign({ ...campaign, [field]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const campaignData = Object.fromEntries(form.entries());
    campaignData.impressions = parseInt(campaignData.impressions);
    campaignData.clicks = parseInt(campaignData.clicks);
    campaignData.spend = parseFloat(campaignData.spend);
    campaignData.roas = parseFloat(campaignData.roas);
    campaignData.launch = campaignData.launch === 'on';

    await fetch('/app/create-campaign', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });

    navigate('/app/manage-campaigns');
  };

  return (
    <Page title="Create New Campaign">
      <Layout>
        <Layout.Section>
          <form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                label="Campaign Name"
                value={campaign.name}
                onChange={handleChange('name')}
                name="name"
              />
              <TextField
                label="Impressions"
                type="number"
                value={campaign.impressions}
                onChange={handleChange('impressions')}
                name="impressions"
              />
              <TextField
                label="Clicks"
                type="number"
                value={campaign.clicks}
                onChange={handleChange('clicks')}
                name="clicks"
              />
              <TextField
                label="Spend"
                type="number"
                value={campaign.spend}
                onChange={handleChange('spend')}
                name="spend"
              />
              <TextField
                label="ROAS"
                type="number"
                value={campaign.roas}
                onChange={handleChange('roas')}
                name="roas"
              />
              <TextField
                label="Launch"
                type="checkbox"
                checked={campaign.launch}
                onChange={handleChange('launch')}
                name="launch"
              />
              <Button submit primary>Create Campaign</Button>
            </FormLayout>
          </form>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default CreateCampaignPage;
