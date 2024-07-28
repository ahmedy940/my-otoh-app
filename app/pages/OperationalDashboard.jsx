import React from 'react';
import { Page, Card, Badge } from '@shopify/polaris';

function OperationalDashboard() {
  return (
    <Page
      title="Operational Dashboard"
      titleMetadata={<Badge status="attention">Monitoring</Badge>}
      primaryAction={{ content: 'Refresh', onAction: () => window.location.reload() }}
    >
      <Card sectioned>
        <p>Here you can see the operational metrics of your campaigns.</p>
      </Card>
    </Page>
  );
}

export default OperationalDashboard;
