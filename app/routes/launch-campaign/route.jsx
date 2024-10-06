// routes/launch-campaign/route.jsx
import { json } from "@remix-run/node";
import { updateCampaign } from "../../db.server"; // Assuming db.server has campaign logic

export async function action({ request }) {
  const formData = await request.formData();
  const campaignId = formData.get("campaignId");

  if (!campaignId) {
    return json({ error: "Campaign ID is required" }, { status: 400 });
  }

  try {
    // Update the campaign status to "ACTIVE"
    const updatedCampaign = await updateCampaign(campaignId, {
      status: "ACTIVE",
    });

    return json({ updatedCampaign });
  } catch (error) {
    console.error("Error launching campaign:", error);
    return json({ error: "Failed to launch campaign" }, { status: 500 });
  }
}
