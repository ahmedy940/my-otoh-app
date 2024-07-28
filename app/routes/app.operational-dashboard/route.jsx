// app/routes/app.operational-dashboard/route.jsx
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { authenticate } from "../../shopify.server";
import OperationalDashboard from "../../pages/OperationalDashboard";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({});
};

export default function OperationalDashboardRoute() {
  return <OperationalDashboard />;
}
