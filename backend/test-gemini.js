require("dotenv").config();
const { analyze } = require("./services/geminiService");

async function run() {
  const result = await analyze("Power cut nearby.");
  console.log("Result:", result);
}
run();
