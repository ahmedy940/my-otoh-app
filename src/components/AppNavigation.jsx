import { Navigation } from '@shopify/polaris';
import {
  HomeMajor,
  MarketingMajor,
  OrdersMajor,
} from '@shopify/polaris-icons';

function AppNavigation() {
  return (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            url: '/app/manage-campaigns',
            label: 'Manage Campaigns',
            icon: MarketingMajor,
          },
          {
            url: '/app/success-dashboard',
            label: 'Success Dashboard',
            icon: HomeMajor,
          },
          {
            url: '/app/operational-dashboard',
            label: 'Operational Dashboard',
            icon: OrdersMajor,
          },
        ]}
      />
    </Navigation>
  );
}

export default AppNavigation;
