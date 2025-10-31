import express, { Application, Request, Response } from "express";
import bookRoutes from "./routes/books.js";
import categoryRoutes from "./routes/categoryRoutes.js";

const app: Application = express();

//  Middleware to parse JSON requests
app.use(express.json());

//  Mount routes
app.use("/books", bookRoutes);
app.use("/categories", categoryRoutes);

//  Root route for quick health check
app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to the Bookstore API");
});

export default app;
