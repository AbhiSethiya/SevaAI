require("dotenv").config();
const mongoose = require("mongoose");
const Complaint = require("./models/Complaint");
const generateTicketId = require("./utils/generateTicketId");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sevaai"; // Add your remote URI if needed here

// Indore base coordinates
const BASE_LAT = 22.7196;
const BASE_LNG = 75.8577;

// Helper to generate random coordinates near Indore
const getRandomCoordinates = () => {
  return {
    lat: BASE_LAT + (Math.random() - 0.5) * 0.1,
    lng: BASE_LNG + (Math.random() - 0.5) * 0.1,
  };
};

const dummyComplaints = [
  {
    department: "electricity",
    rawText: "Streetlight has been out for 3 days near Rajwada.",
    refinedText: "Streetlight not working",
    locationName: "Rajwada",
    priority: "High",
    status: "pending",
  },
  {
    department: "water",
    rawText: "Major pipe burst on MG Road, flooding the street.",
    refinedText: "Major water pipe burst",
    locationName: "MG Road",
    priority: "High",
    status: "in-progress",
  },
  {
    department: "waste",
    rawText: "Garbage hasn't been collected from Palasia square.",
    refinedText: "Garbage accumulation",
    locationName: "Palasia",
    priority: "Medium",
    status: "pending",
  },
  {
    department: "road",
    rawText: "Huge pothole on bypass road causing accidents.",
    refinedText: "Dangerous pothole",
    locationName: "Bypass Road",
    priority: "High",
    status: "resolved",
  },
  {
    department: "drainage",
    rawText: "Sewage water overflowing into the street in Vijay Nagar.",
    refinedText: "Sewage overflow",
    locationName: "Vijay Nagar",
    priority: "High",
    status: "in-progress",
  },
  {
    department: "electricity",
    rawText: "Frequent power cuts in Bhawarkuan area.",
    refinedText: "Frequent power cuts",
    locationName: "Bhawarkuan",
    priority: "Medium",
    status: "resolved",
  },
  {
    department: "road",
    rawText: "Broken footpath near 56 Dukan.",
    refinedText: "Damaged footpath",
    locationName: "56 Dukan",
    priority: "Low",
    status: "pending",
  },
  {
    department: "waste",
    rawText: "Dead animal on the road near LIG square.",
    refinedText: "Dead animal removal required",
    locationName: "LIG Square",
    priority: "High",
    status: "resolved",
  },
  {
    department: "water",
    rawText: "No water supply since morning in Annapurna area.",
    refinedText: "No water supply",
    locationName: "Annapurna",
    priority: "High",
    status: "pending",
  },
  {
    department: "other",
    rawText: "Stray dogs chasing vehicles near Geeta Bhawan.",
    refinedText: "Stray dog menace",
    locationName: "Geeta Bhawan",
    priority: "Medium",
    status: "in-progress",
  }
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully!");

    console.log("Clearing old dummy complaints...");
    // Optional: Only run this if you want to wipe existing complaints!
    // await Complaint.deleteMany({}); 

    console.log("Generating realistic complaint data...");
    
    // Some random user IDs (you can replace these with actual user ObjectIds if you want)
    const dummyUserId = new mongoose.Types.ObjectId();

    const complaintsToInsert = dummyComplaints.map(data => {
      // Create random dates from the past 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      return {
        ticketId: generateTicketId(),
        userId: dummyUserId, // assigning to a dummy user
        rawText: data.rawText,
        refinedText: data.refinedText,
        department: data.department,
        aiSuggestedDepartment: data.department,
        aiConfidence: Math.floor(Math.random() * 20) + 80, // 80-99%
        coordinates: getRandomCoordinates(),
        locationName: data.locationName,
        priority: data.priority,
        status: data.status,
        upvotes: Math.floor(Math.random() * 50),
        images: [],
        createdAt: createdAt,
        updatedAt: new Date(),
        history: [
          {
            status: "pending",
            updatedBy: dummyUserId,
            note: "Complaint submitted",
            timestamp: createdAt
          },
          ...(data.status !== "pending" ? [{
            status: data.status,
            updatedBy: dummyUserId, // usually an admin ID
            note: `Status updated to ${data.status}`,
            timestamp: new Date()
          }] : [])
        ]
      };
    });

    await Complaint.insertMany(complaintsToInsert);
    console.log(`Successfully added ${complaintsToInsert.length} random complaints!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
