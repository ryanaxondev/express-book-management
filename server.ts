import "dotenv/config"; // Load environment variables
import app from "./src/app.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
