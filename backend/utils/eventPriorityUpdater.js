const cron = require("node-cron");
const events = require("./festivalEvents.json");
const Complaint = require("../models/Complaint"); // adjust path

// Run every alternate night at 2 AM --> "0 2 */2 * *"
cron.schedule("0 2 */2 * *", async () => {
  console.log("🔄 Running scheduled event priority update...");

  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    events.forEach(async (event) => {
      if (today >= event.startDate && today <= event.endDate) {
        console.log(`🎉 Festival/Event today: ${event.name}`);

        for (const location of event.highPriorityLocations) {
          await Complaint.updateMany(
            { location: location }, // assuming you store location in complaint
            { $set: { priority: "High" } }
          );
          console.log(`✅ Updated complaints at ${location} to HIGH priority`);
        }
      }
    });
  } catch (error) {
    console.error("❌ Error updating event priorities:", error.message);
  }
});
