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

- `Cara Notte`  — `https://github.com/Cara-Notte`
- `Andy EK`     — `https://github.com/andyek05`
- `Pierre`      — `https://github.com/pierreroger311`
- `Devlin`      — `https://github.com/fish1pomu`

## 🚀 Usage

1. Open the app homepage and create an account (or log in).
2. Browse the catalog, search for books, or open recommendations.
3. Open a book detail page to rate/review, favorite it, or add it to a collection.
4. Borrow books and manage returns/extensions from your loans page.
5. If you are a librarian/admin, use the management panels to maintain books and moderation tasks.

## 📸 Preview Screenshots
- Homepage hero + featured books </br> </br>
  <img width="421" height="319" alt="Screenshot 2026-03-12 170422" src="https://github.com/user-attachments/assets/6be2038e-0538-4ae5-8cc2-7ca26439faec" /> </br> </br> </br>
- Books catalog page </br> </br>
  <img width="424" height="350" alt="Screenshot 2026-03-12 170506" src="https://github.com/user-attachments/assets/4d0f3b69-1466-43fb-9b7c-70b23b996830" /> </br> </br> </br>
- Book details with rating/review actions </br> </br>
  <img width="811" height="527" alt="Screenshot 2026-03-12 170910" src="https://github.com/user-attachments/assets/46ac29ff-0d0c-4e29-b84b-3bacd582a07b" /> </br> </br> </br>
- "My Library" page: list of favorites + collections </br> </br>
  <img width="746" height="469" alt="Screenshot 2026-03-12 171033" src="https://github.com/user-attachments/assets/2c2ba085-bb9b-4e3a-ac45-b3537fc44321" /> </br> </br> </br>
- Loan page </br> </br>
  <img width="790" height="528" alt="Screenshot 2026-03-12 170947" src="https://github.com/user-attachments/assets/a564ed80-d758-4045-845d-57a8365369b5" /> </br> </br> </br>
- Librarian panel - exclusive to librarian account type </br> </br>
  <img width="675" height="541" alt="Screenshot 2026-03-12 171131" src="https://github.com/user-attachments/assets/d724b216-f3ef-488f-a952-f69e0adc97ac" /> </br> </br> </br>
- Admin panel - exclusive to admin account type, has the feature from librarian account type as well </br> </br>
  <img width="592" height="602" alt="Screenshot 2026-03-12 171154" src="https://github.com/user-attachments/assets/570451d0-a3c5-4f78-837e-1b52820ff0c0" />
  <img width="802" height="592" alt="Screenshot 2026-03-12 171204" src="https://github.com/user-attachments/assets/d1576c24-3b76-4e56-b1b3-f61772bdd44a" />

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
