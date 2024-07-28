import React from 'react';
import { Page, Card, Badge } from '@shopify/polaris';

function SuccessDashboard() {
  return (
    <Page
      title="Success Dashboard"
      titleMetadata={<Badge status="success">Active</Badge>}
      primaryAction={{ content: 'Refresh', onAction: () => window.location.reload() }}
    >
      <Card sectioned>
        <p>Here you can see the metrics of your successful campaigns.</p>
      </Card>
    </Page>
  );
}

export default SuccessDashboard;
