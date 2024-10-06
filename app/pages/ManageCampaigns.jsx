// 1. Frontend Setup (ManageCampaigns.jsx)
import React, { useState, useEffect, useCallback } from 'react';
import polaris from '@shopify/polaris';
import { useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import * as XLSX from 'xlsx';
import { useLoaderData } from '@remix-run/react';
import CreateCampaignModal from './CreateCampaignModal';

const {
  Page,
  IndexTable,
  Card,
  Button,
  Badge,
  TextField,
  Select,
  Spinner,
  Stack,
  Pagination,
} = polaris;

function ManageCampaigns() {
  const app = useAppBridge();
  const fetchWithAuth = authenticatedFetch(app);

  const { campaigns, totalItems } = useLoaderData();

  console.log('Loaded campaigns:', campaigns);
  console.log('Total items:', totalItems);

  // Transform the campaign data for use in the table
  const transformedCampaigns = campaigns.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    spend: campaign.spend,
    roas: campaign.roas,
    status: campaign.status,
  }));

  console.log('Transformed campaigns:', transformedCampaigns);

  // State for filtered campaigns, filters, loading status, pagination, selected rows, and modal visibility
  const [filteredCampaigns, setFilteredCampaigns] = useState(transformedCampaigns);
  const [filters, setFilters] = useState({ name: '', impressions: '', clicks: '', roas: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 10, totalItems });
  const [selectedResources, setSelectedResources] = useState([]);
  const [isModalActive, setModalActive] = useState(false);

  console.log('Initial filtered campaigns:', filteredCampaigns);
  console.log('Initial filters:', filters);
  console.log('Initial pagination:', pagination);

  const resourceName = { singular: 'campaign', plural: 'campaigns' };

  // Handlers for opening and closing the modal
  const handleOpenModal = () => {
    console.log('Opening modal');
    setModalActive(true);
  };
  const handleCloseModal = () => {
    console.log('Closing modal');
    setModalActive(false);
  };

  // Handler for creating a new campaign and updating the list
  const handleCreateCampaign = (newCampaign) => {
    console.log('Creating new campaign:', newCampaign);
    setFilteredCampaigns([...filteredCampaigns, newCampaign]);
    handleCloseModal();
  };

  // Fetch campaigns from the backend whenever filters or pagination change
  useEffect(() => {
    async function getCampaignsFromBackend() {
      setLoading(true);
      console.log('Fetching campaigns with filters:', filters, 'and pagination:', pagination);

      const queryParams = new URLSearchParams({
        name: filters.name || '',
        impressions: filters.impressions || '',
        clicks: filters.clicks || '',
        roas: filters.roas || '',
        status: filters.status || '',
        page: pagination.currentPage,
        size: pagination.pageSize,
      }).toString();

      try {
        const response = await fetchWithAuth(`/app/manage-campaigns?${queryParams}`);
        console.log('Fetch response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Fetch response error:', errorText);
          throw new Error(`Failed to fetch campaigns: ${errorText}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data);

        if (!data.campaigns || !Array.isArray(data.campaigns)) {
          throw new Error('Invalid response format: expected "campaigns" array');
        }

        const transformedData = data.campaigns.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
          impressions: campaign.impressions,
          clicks: campaign.clicks,
          spend: campaign.spend,
          roas: campaign.roas,
          status: campaign.status,
        }));
        setFilteredCampaigns(transformedData);
        setPagination((prev) => ({ ...prev, totalItems: data.totalItems }));
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    }

    getCampaignsFromBackend();
  }, [filters, pagination.currentPage, pagination.pageSize]);

  // Handler for updating filter values
  const handleFilterChange = (field, value) => {
    console.log(`Updating filter ${field} to value:`, value);
    setFilters({ ...filters, [field]: value });
  };

  // Apply filters and reset pagination to the first page
  const applyFilters = () => {
    console.log('Applying filters:', filters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Reset all filters and pagination
  const resetFilters = () => {
    console.log('Resetting filters');
    setFilters({ name: '', impressions: '', clicks: '', roas: '', status: '' });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Export filtered campaigns to an Excel file
  const exportCampaignsToExcel = () => {
    if (filteredCampaigns.length === 0) {
      console.error('No campaigns available to export');
      return;
    }
    console.log('Exporting campaigns to Excel');
    const worksheet = XLSX.utils.json_to_sheet(filteredCampaigns);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Campaigns");
    XLSX.writeFile(workbook, `Campaigns_${new Date().toISOString()}.xlsx`);
  };

  // Handler for deleting a campaign
  const handleDelete = async (campaignId) => {
    console.log('Deleting campaign with ID:', campaignId);
    const formData = new FormData();
    formData.append('_action', 'delete');
    formData.append('campaignId', campaignId);

    try {
      const response = await fetchWithAuth('/app/manage-campaigns', {
        method: 'POST',
        body: formData,
      });
      console.log('Delete response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }
      setFilteredCampaigns(filteredCampaigns.filter((campaign) => campaign.id !== campaignId));
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  // Handler for selecting/deselecting a row in the table
  const handleRowClick = (campaignId) => {
    console.log('Toggling selection for campaign with ID:', campaignId);
    setSelectedResources((prevSelected) =>
      prevSelected.includes(campaignId)
        ? prevSelected.filter(id => id !== campaignId)
        : [...prevSelected, campaignId]
    );
  };

  // Markup for each row in the campaigns table
  const rowMarkup = filteredCampaigns.map((campaign) => (
    <IndexTable.Row
      id={campaign.id}
      key={campaign.id}
      selected={selectedResources.includes(campaign.id)}
      position={campaign.id}
      onClick={() => handleRowClick(campaign.id)}
    >
      <IndexTable.Cell>{campaign.name}</IndexTable.Cell>
      <IndexTable.Cell>{campaign.impressions}</IndexTable.Cell>
      <IndexTable.Cell>{campaign.clicks}</IndexTable.Cell>
      <IndexTable.Cell>EGP {campaign.spend}</IndexTable.Cell>
      <IndexTable.Cell>EGP {campaign.roas}</IndexTable.Cell>
      <IndexTable.Cell>
        <Badge status={campaign.status === 'active' ? 'success' : 'warning'}>
          {campaign.status}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Stack>
          <Button primary>Success</Button>
          <Button>Enhance</Button>
          <Button destructive onClick={() => handleDelete(campaign.id)}>Delete</Button>
        </Stack>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  // Actions available for bulk operations
  const promotedBulkActions = [
    {
      content: 'Delete selected',
      onAction: () => {
        console.log('Bulk delete action triggered');
        console.log('Selected resources:', selectedResources);
      },
    },
    {
      content: 'Export as CSV',
      onAction: exportCampaignsToExcel,
    },
  ];

  return (
    <Page title="Manage Campaigns">
      <Card sectioned>
        <TextField
          label="Campaign Name"
          value={filters.name}
          onChange={(value) => handleFilterChange('name', value)}
        />
        <TextField
          label="Impressions"
          value={filters.impressions}
          onChange={(value) => handleFilterChange('impressions', value)}
        />
        <TextField
          label="Clicks"
          value={filters.clicks}
          onChange={(value) => handleFilterChange('clicks', value)}
        />
        <Select
          label="Status"
          options={['', 'Active', 'Paused', 'Completed']}
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
        />
        <Button onClick={applyFilters}>Search</Button>
        <Button onClick={resetFilters}>Reset</Button>
      </Card>

      <Button onClick={exportCampaignsToExcel} primary>
        Export to Excel
      </Button>

      <Button primary onClick={handleOpenModal}>
        Create New Campaign
      </Button>

      {loading ? (
        <Spinner />
      ) : (
        <Card>
          <IndexTable
            resourceName={resourceName}
            itemCount={filteredCampaigns.length}
            selectedItemsCount={selectedResources.length}
            promotedBulkActions={promotedBulkActions}
            headings={[
              { title: 'Campaign Name' },
              { title: 'Impressions' },
              { title: 'Clicks' },
              { title: 'Spend' },
              { title: 'ROAS' },
              { title: 'Status' },
              { title: 'Actions' },
            ]}
            selectable
            rows={rowMarkup}
          />
          <Pagination
            hasPrevious={pagination.currentPage > 1}
            onPrevious={() => {
              console.log('Navigating to previous page');
              setPagination({ ...pagination, currentPage: pagination.currentPage - 1 });
            }}
            hasNext={pagination.currentPage < Math.ceil(pagination.totalItems / pagination.pageSize)}
            onNext={() => {
              console.log('Navigating to next page');
              setPagination({ ...pagination, currentPage: pagination.currentPage + 1 });
            }}
          />
        </Card>
      )}

      <CreateCampaignModal
        active={isModalActive}
        onClose={handleCloseModal}
        onSubmit={handleCreateCampaign}
      />
    </Page>
  );
}

export default ManageCampaigns;

// 2. Backend API Setup (create-campaign.api.jsx)
import { json } from '@remix-run/node';
import prisma from '~/db.server';

export async function action({ request }) {
  const formData = await request.formData();
  const { name, objective, budget, audience, placements, creative } = Object.fromEntries(formData);

  try {
    console.log('Creating new campaign with data:', { name, objective, budget, audience, placements, creative });
    const newCampaign = await prisma.campaign.create({
      data: {
        name,
        objective,
        budget: parseFloat(budget),
        audience,
        placements,
        creative,
        status: 'DRAFT'
      }
    });
    console.log('New campaign created:', newCampaign);
    return json({ success: true, campaign: newCampaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return json({ success: false, message: 'Error creating campaign.' });
  }
}
