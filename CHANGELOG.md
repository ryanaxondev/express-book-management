# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2025-11-13

### Added

* Introduced **UUID-based identifiers** for all entities (`books` & `categories`)
* Added `UUID` type definition in `src/types/bookTypes.ts` for strong type safety
* Created new utility: `src/utils/mapToBookWithCategory.ts` — maps joined book-category rows to unified response model
* Updated Postman collection and environment with UUID variables
* Added new section in README detailing UUID migration and structure

### Changed

* Replaced all integer `id` and `categoryId` fields with **UUIDs**
* Updated controllers (`bookController.ts`, `categoryController.ts`) to use UUID route parameters
* Modified `bookSchema` and `categorySchema` with `uuidSchema` validation
* Updated `routes/books.ts` and `routes/categoryRoutes.ts` to expect UUIDs in URL params
* Updated database and Drizzle models to align with UUID usage
* Updated tests and Postman requests to use UUIDs instead of numeric IDs

### Fixed

* Resolved type inconsistencies between `BookWithCategory` and joined Drizzle responses
* Prevented invalid UUID parsing in request validation layer

### Added files

* `src/utils/mapToBookWithCategory.ts` — maps database join results to `BookWithCategory` structure

### Commit Reference

Ref:
`git commit -m "Migrate IDs to UUID

* Introduced UUID type in bookTypes.ts
* Updated schemas, controllers, and routes
* Added mapToBookWithCategory util
* Updated Postman and tests"`

## [2.1.0] - 2025-11-02

### Added
- **Zod validation** for all `POST` and `PUT` requests (`books` & `categories`)
- **Structured error responses** using `format()` for improved readability
- **Full-text search** support in `GET /books` via query parameter `q`

### Changed
- Controllers refactored for **type safety** and **cleaner error handling**
- Improved `categoryId` validation logic to prevent invalid foreign keys
- Consistent `BookWithCategory` and `Category` response types across controllers
- Updated README with validation and search documentation

### Fixed
- Prevented insert/update when `categoryId` refers to a non-existent category
- Replaced deprecated `flatten()` with `format()` in Zod error formatting

### Added files
- `src/validation/bookSchema.ts` — defines Zod schema for book validation (`bookSchema`, `updateBookSchema`)
- `src/validation/categorySchema.ts` — defines Zod schema for category validation (`categorySchema`, `updateCategorySchema`)

### Commit Reference
Ref: `git commit -m "Refactor book controllers with Zod validation and full-text search"`

## [2.0.0]

### Added
- Initial Express + TypeScript API with Drizzle ORM and Dockerized PostgreSQL (commit eeb61c3)
- Environment setup with PostgreSQL variables in `.env.example` and secure Docker Compose config (commit 0f97fd4)
- Categories table and support for category in books:
  - Create categories table with columns: `id`, `name`, `description`
  - Add `categoryId` foreign key to books table (`ON DELETE SET NULL`)
  - Full CRUD for categories (controller & routes)
  - Include category in book responses for create/update/get
  - Updated TypeScript types (`Category`, `NewCategory`, `BookWithCategory`, `BookInput`)
  - Updated `mapToBookWithCategory` for correct Drizzle join structure
  - Tested endpoints with curl to ensure correct relationships (commit 882e698)

- Postman collection and environment files for API testing (`/docs/postman`) and README section explaining usage (commit 75d63f0)

### Changed
- Updated Book Controller: added strict category validation on create/update (404 if categoryId does not exist)
- Unified Book JSON responses to always return `BookWithCategory` structure (includes nested category object when available)
- Update operations now safely validate and apply categoryId changes, supporting clearing category via `null`
- Improved error messages for invalid categories or non-existing books
- README updates (commit 86bdb6)

### Fixed
- Added `description` field handling in `createBook` endpoint; previously ignored in request body causing `null` in DB (commit 1ea9c05)
- Added `description` column to `books` table and updated controller accordingly (commit 155a9ce)

### Deprecated
- N/A

### Removed
- N/A

### Security
- N/A

### Added files
- `CHANGELOG.md` — new changelog file for project history
