# 📚 Libly

![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-5.x-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/database-MySQL-4479A1?logo=mysql&logoColor=white)

> *Your digital library companion — discover, organize, borrow, and review books in one place.*

## 🌟 Highlights

- Full-stack library system with authentication, role-based access, and MySQL-backed data.
- Book discovery features including search, random picks, top-rated books, and most-favorited books.
- Personal reader tools: ratings, reviews, favorites, custom collections, and borrowing history.
- Dedicated role dashboards for member, librarian, and admin workflows.
- Late-fee support for overdue returns (`Rp. 2000` first day + `Rp. 1000` per additional day).

## ℹ️ Overview

Libly is a web-based library management system built with **Node.js + Express** on the backend and a **vanilla HTML/CSS/JavaScript** frontend. It is designed to make library experiences more interactive: users can browse books, leave ratings and reviews, borrow and return books, build personal collections, and manage account settings.

On the backend, Libly provides REST-style endpoints for users, books, reviews, loans, collections, recommendations, and profile/account management. Authentication is JWT-based, and role checks are used to separate permissions for members, librarians, and admins.

### ✍️ Authors

Built by the **Libly team**.

If you want to personalize this section, replace it with your name and GitHub profile, for example:

- `Your Name` — `https://github.com/your-username`

## 🚀 Usage

1. Open the app homepage and create an account (or log in).
2. Browse the catalog, search for books, or open recommendations.
3. Open a book detail page to rate/review, favorite it, or add it to a collection.
4. Borrow books and manage returns/extensions from your loans page.
5. If you are a librarian/admin, use the management panels to maintain books and moderation tasks.

Suggested README screenshots (replace placeholders with real image links after upload):

- `[screenshot of homepage hero + featured books]`
- `[screenshot of books catalog/search view]`
- `[screenshot of single book details with rating/review actions]`
- `[screenshot of my library (favorites + collections)]`
- `[screenshot of loans page showing active/history loans]`
- `[screenshot of admin or librarian panel]`

## ⬇️ Installation

### Prerequisites

- Node.js **18+**
- MySQL / MariaDB server

### Setup

```bash
git clone <your-repo-url>
cd Libly
npm install
```

Create your database and import the provided SQL schema/data:

```bash
mysql -u <user> -p <database_name> < libly_library.sql
```

Set environment variables (recommended):

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES` (optional, default `7d`)
- `USE_COOKIE_AUTH` (optional, set `true` to use cookie auth)

Run the server:

```bash
npm start
```

The app runs on:

- `http://localhost:3000` (or `PORT` if configured)

## 💭 Feedback and Contributing

Feedback, bug reports, and feature requests are welcome.

- Open an Issue in this repository for bugs or feature ideas.
- Start a Discussion if you want to suggest larger improvements or roadmap ideas.
- Pull requests are welcome for fixes, enhancements, and documentation improvements.
