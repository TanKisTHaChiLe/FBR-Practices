const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_ID = process.env.SERVER_ID || "unknown";

app.get("/", (req, res) => {
  res.json({
    server: SERVER_ID,
    port: PORT,
    hostname: require("os").hostname(),
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[${SERVER_ID}] Server started on port ${PORT}`);
});