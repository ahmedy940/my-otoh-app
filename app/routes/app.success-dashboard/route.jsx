// /app/routes/app.success-dashboard/route.jsx
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { authenticate } from "../../shopify.server";
import SuccessDashboard from "../../pages/SuccessDashboard"; // Correct path

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({});
};

export default function SuccessDashboardRoute() {
  return <SuccessDashboard />;
}
