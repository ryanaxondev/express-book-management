# 📚 Bookstore API

A **Node.js + TypeScript** REST API for managing books, powered by **Express**, **Drizzle ORM**, and **PostgreSQL**.

---

## 🗂 Project Structure

```
bookstore/
│── src/
│   ├── app.ts               # Express app configuration
│   ├── routes/
│   │   └── books.ts         # Book routes
│   ├── controllers/
│   │   └── bookController.ts # Business logic
│   └── db/
│       ├── index.ts         # Drizzle + PostgreSQL connection
│       └── schema.ts        # Database schema
│── server.ts                # Entry point
│── package.json
│── tsconfig.json
│── drizzle.config.ts
│── docker-compose.yml
│── .env
│── .env.example
│── .gitignore
```

---

## ⚡ Features

* ✅ CRUD operations for books
* ✅ Persistent storage with PostgreSQL
* ✅ Type-safe ORM using Drizzle
* ✅ TypeScript for cleaner, safer development
* ✅ Docker support for easy local setup
* ✅ Environment variables for sensitive data

---

## 🔧 Prerequisites

* Node.js **v18+**
* **Docker** (recommended for PostgreSQL)
* npm (or pnpm / yarn)

---

## ⚙️ Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/ryanaxondev/express-book-management.git
cd express-book-management
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create your `.env` file

```bash
cp .env.example .env
```

Then edit `.env` and set your connection string and optional port:

```env
DATABASE_URL=postgres://postgres:mysecretpassword@localhost:5433/bookstore
PORT=3000
```

> If using Docker, keep the same host/port as defined in `docker-compose.yml`.

---

## 🛣️ Docker Setup

🐳 **Run PostgreSQL with Docker**

```bash
docker compose up -d
```

> This will start a PostgreSQL container on port `5433` (by default).
> You can connect via any SQL client or CLI to verify:
>
> ```bash
> psql -h localhost -p 5433 -U postgres -d bookstore
> ```

### 🧱 Database Setup (Drizzle ORM)

**Run initial migration:**

```bash
npm run db:push
```

**Generate new migration after changing schema:**

```bash
npm run db:generate
```

---

## 🚀 Running the API

### Development

```bash
npm run dev
```

* Runs TypeScript directly via `tsx watch`
* Auto reloads on file changes
* Uses `.ts` imports directly

### Production

```bash
npm run build
npm start
```

* Builds TypeScript → JavaScript into `dist/`
* Starts the compiled app with Node.js

---

## 📚 API Endpoints

| Method | Endpoint     | Description         | Request Body                                   |
| ------ | ------------ | ------------------- | ---------------------------------------------- |
| GET    | `/books`     | Get all books       | —                                              |
| POST   | `/books`     | Add a new book      | `{ "title": "Book A", "author": "John Doe" }`  |
| PUT    | `/books/:id` | Update a book by ID | `{ "title": "Updated", "author": "Jane Doe" }` |
| DELETE | `/books/:id` | Delete a book by ID | —                                              |
| GET    | `/`          | Welcome message     | —                                              |

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

> If your Drizzle version doesn’t use `:pg` suffix, you can omit it:
> `"db:generate": "drizzle-kit generate"` and `"db:push": "drizzle-kit push"`

---

## 🧩 Notes

* Store **all secrets** (e.g. database URL) in `.env`
* Drizzle generates migrations in the `/drizzle` folder
* Use `npm run db:generate` after updating your schema
* Docker Compose runs PostgreSQL automatically for local development
* Make sure `DATABASE_URL` port matches the container’s exposed port

---

## ✅ Recommended Tools

* **Postman** / **Insomnia** — test the API endpoints
* **VS Code** — with TypeScript & ESLint extensions
* **pgAdmin** / **TablePlus** — for managing PostgreSQL
* **curl** — for quick command-line testing

---

## 💞 Author

Developed with ❤️ by [Ryan Carter](https://github.com/ryanaxondev)

---

## 📇 Topics

```
nodejs express rest-api crud postgresql drizzle-orm backend typescript javascript web-development api book-api
```
