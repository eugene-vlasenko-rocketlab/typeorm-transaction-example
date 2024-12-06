import express from "express";
import bodyParser from "body-parser";
import { AppDataSource } from "@src/database";
import { initializeIoC, registerControllers } from "@src/ioc";

const app = express();
app.use(bodyParser.json());

// Initialize DataSource
AppDataSource.initialize()
  .then(() => {
    console.log("DataSource initialized");

    // Initialize IoC container
    initializeIoC();
    console.log("IoC container initialized");

    // Register controllers and their routes
    registerControllers(app);
    console.log("Controllers registered");
  })
  .catch((err) => console.error("Failed to initialize DataSource:", err));

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
