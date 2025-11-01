# 📚 Bookstore API (v2)

A **Node.js + TypeScript** REST API for managing **books and categories**, powered by **Express**, **Drizzle ORM**, and **PostgreSQL**.

Now upgraded to a **relational data model** with category-based organization for books.

---

## ⚡ Quick Start

```bash
git clone https://github.com/ryanaxondev/express-book-management.git
cd express-book-management
npm install
cp .env.example .env
# Update .env values if needed
docker compose up -d
npm run db:push
npm run dev
```

> The API will run at **[http://localhost:3000](http://localhost:3000)** by default.

---

## 🧱 Tech Stack

* **Node.js + TypeScript**
* **Express.js**
* **Drizzle ORM**
* **PostgreSQL (Docker)**
* **Docker Compose**

---

## 🗂 Project Structure

```
bookstore/
│── src/
│   ├── app.ts                     # Express app configuration
│   ├── routes/
│   │   ├── books.ts               # Book routes
│   │   └── categoryRoutes.ts      # Category routes
│   ├── controllers/
│   │   ├── bookController.ts      # Book logic (with category support)
│   │   └── categoryController.ts  # Category CRUD logic
│   └── db/
│       ├── index.ts               # Drizzle + PostgreSQL connection
│       └── schema.ts              # Database schema (Books + Categories)
│
│── docs/
│   └── postman/
│       ├── Bookstore_API_Pro_Collection.json   # Postman collection for all endpoints
│       └── Bookstore_API_Environment.json      # Postman environment configuration
│
│── server.ts                      # Entry point
│── package.json
│── tsconfig.json
│── drizzle.config.ts
│── docker-compose.yml
│── .env
│── .env.example
│── .gitignore
```

---

## ⚙️ Setup & Configuration

### Environment Variables

```env
DATABASE_URL=postgres://postgres:mysecretpassword@localhost:5433/bookstore
PORT=3000
```

> Keep host/port consistent with `docker-compose.yml` when using Docker.

---

## 🛣️ Docker Setup

```bash
docker compose up -d
```

> Starts a PostgreSQL container on port `5433`.

Verify connection:

```bash
psql -h localhost -p 5433 -U postgres -d bookstore
```

---

## 🧱 Database (Drizzle ORM)

Apply schema migrations:

```bash
npm run db:push
```

Generate new migrations:

```bash
npm run db:generate
```

---

## 🚀 Running the API

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

---

## 📚 API Endpoints

### 📘 Books

| Method | Endpoint     | Description             | Request Body Example                                            |
| ------ | ------------ | ----------------------- | --------------------------------------------------------------- |
| GET    | `/books`     | Get all books           | —                                                               |
| GET    | `/books/:id` | Get a single book by ID | —                                                               |
| POST   | `/books`     | Add a new book          | `{ "title": "Book A", "author": "John Doe", "categoryId": 1 }`  |
| PUT    | `/books/:id` | Update book details     | `{ "title": "Updated", "author": "Jane Doe", "categoryId": 2 }` |
| DELETE | `/books/:id` | Delete a book by ID     | —                                                               |

**Example Response:**

```json
{
  "id": 1,
  "title": "1984",
  "author": "George Orwell",
  "category": {
    "id": 1,
    "name": "Fiction"
  }
}
```

---

### 🏷️ Categories

| Method | Endpoint          | Description           | Request Body Example                                          |
| ------ | ----------------- | --------------------- | ------------------------------------------------------------- |
| GET    | `/categories`     | Get all categories    | —                                                             |
| GET    | `/categories/:id` | Get category by ID    | —                                                             |
| POST   | `/categories`     | Create a new category | `{ "name": "Science", "description": "Books about physics" }` |
| PUT    | `/categories/:id` | Update a category     | `{ "name": "Tech", "description": "Updated desc" }`           |
| DELETE | `/categories/:id` | Delete a category     | —                                                             |

> Deleting a category will **not** delete related books; their `categoryId` becomes `NULL`.

---

## 🧩 Database Schema Overview

### Table: `books`

| Column       | Type         | Description                |
| ------------ | ------------ | -------------------------- |
| `id`         | serial (PK)  | Book ID                    |
| `title`      | text         | Book title                 |
| `author`     | text         | Author name                |
| `categoryId` | integer (FK) | Linked category (nullable) |

### Table: `categories`

| Column        | Type        | Description      |
| ------------- | ----------- | ---------------- |
| `id`          | serial (PK) | Category ID      |
| `name`        | text        | Category name    |
| `description` | text (opt.) | Optional details |

---

## 🧠 TypeScript Models

```ts
export type Category = {
  id: number;
  name: string;
  description?: string;
};

export type BookInput = {
  title: string;
  author: string;
  categoryId?: number;
};

export type BookWithCategory = BookInput & {
  id: number;
  category?: Category | null;
};
```

---

## 🧪 Testing

Use **curl**, **Postman**, or **Insomnia** to test endpoints.

Example:

```bash
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Fiction", "description": "Narrative works"}'
```

---

## 🧪 Testing the API with Postman

You can easily test the Bookstore API using the provided Postman collection and environment files.

### 🔧 Setup
1. Import both files into **Postman**:
   - `/docs/postman/Bookstore_API_Pro_Collection.json`
   - `/docs/postman/Bookstore_API_Environment.json`
2. Select the `Bookstore API` environment in Postman.
3. Make sure your server is running at the correct `base_url` (default: `http://localhost:3000`).

### 🚀 Usage
Each endpoint includes ready-to-use examples with:
- Dynamic variables such as `{{base_url}}` and `{{book_id}}`
- Predefined request bodies and headers
- Clear folder organization (Books, Categories)

This setup helps frontend and QA teams quickly test and explore the API without needing to check the source code.

---

## 📦 npm Scripts

```json
{
  "dev": "tsx watch server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "db:generate": "drizzle-kit generate:pg",
  "db:push": "drizzle-kit push:pg"
}
```

---

## ✅ Best Practices

* Keep all secrets in `.env`
* Run `npm run db:generate` after editing `schema.ts`
* Use Docker for consistent PostgreSQL setup
* Use `pgAdmin` or `TablePlus` for database visualization

---

## 🧰 Recommended Tools

* **VS Code** — TypeScript & ESLint extensions
* **Postman / Insomnia** — test REST endpoints
* **pgAdmin / TablePlus** — manage PostgreSQL
* **curl** — quick CLI testing

---

## 💞 Author

Developed with ❤️ by [Ryan Carter](https://github.com/ryanaxondev) — part of the AXON initiative.

---

## ⚖️ License

This project is licensed under the **MIT License**.

---

### 🧩 Part of the AXON Open Source Ecosystem

This project is part of **AXON**, a collection of open-source tools and libraries
designed for high-quality, scalable web development.
