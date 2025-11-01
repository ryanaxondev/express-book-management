# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
