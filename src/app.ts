import express, { Application, Request, Response } from "express";
import bookRoutes from "./routes/books.js";

const app: Application = express();

// Middleware to parse JSON requests
app.use(express.json());

// Book routes
app.use("/books", bookRoutes);

// Root route for testing API
app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to the Bookstore API");
});

export default app;
