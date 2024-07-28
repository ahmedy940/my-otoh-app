import { Outlet, Link } from "@remix-run/react";
import { Page } from "@shopify/polaris";

export default function Index() {
  return (
    <Page>
      <nav>
        <ul>
          <li>
            <Link to="manage-campaigns">Manage Campaigns</Link>
          </li>
          <li>
            <Link to="create-campaign">Create New Campaign</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </Page>
  );
}
