import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../../shopify.server"; // Adjusted path
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppNavigation from '../../components/AppNavigation'; // Adjusted path
import ManageCampaigns from '../../pages/ManageCampaigns';  // Adjusted path
import SidePanel from '../../components/SidePanel';        // Adjusted path

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <Router>
        <NavMenu>
          <Link to="/app" rel="home">
            Home
          </Link>
          <Link to="/app/additional">Additional page</Link>
        </NavMenu>
        <Frame
          navigation={<AppNavigation />}
          topBar={null}
          secondaryMenu={<SidePanel />}
        >
          <Routes>
            <Route path="/app" element={<Outlet />}>
              <Route path="manage-campaigns" element={<ManageCampaigns />} />
              {/* Add other routes here */}
            </Route>
          </Routes>
        </Frame>
      </Router>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
