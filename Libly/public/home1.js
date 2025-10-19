document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1️⃣ Fetch all books from backend
    const res = await fetch("/books"); // Adjust to your actual backend endpoint
    if (!res.ok) throw new Error("Failed to fetch books");
    const books = await res.json();

    if (!Array.isArray(books) || books.length === 0) {
      console.warn("No books found");
      return;
    }

    // 2️⃣ Find book with the highest avg_rating
    const topBook = books.reduce((highest, current) => {
      const highestRating = Number(highest.avg_rating) || 0;
      const currentRating = Number(current.avg_rating) || 0;
      return currentRating > highestRating ? current : highest;
    });

    // 3️⃣ Render the home section
    renderHomeSection(topBook);

  } catch (err) {
    console.error("Error loading top-rated book:", err);
  }
});

function renderHomeSection(book) {
  const container = document.querySelector(".container-home");

  // Set background
  container.style.backgroundImage = `url(${book.cover_url || "default-cover.jpg"})`;
  container.style.backgroundSize = "cover";
  container.style.backgroundPosition = "center";
  container.style.position = "relative";
  container.style.height = "100vh"; // Fill viewport height

  // Add overlay + content
  container.innerHTML = `
    <div class="home-overlay"></div>
    <div class="home-content">
      <div class="home-left">
        <img class="home-cover" src="${book.cover_url || "default-cover.jpg"}" alt="${book.title}">
      </div>
      <div class="home-right">
        <h1 class="home-title">${book.title}</h1>
        <p class="home-genres">${book.genres ? book.genres.map(g => g.name).join(", ") : "Unknown genre"}</p>
        <p class="home-description">${book.description || "No description available."}</p>
        <p class="home-rating">⭐ ${book.avg_rating ? Number(book.avg_rating).toFixed(1) : "N/A"} (${book.rating_count || 0} ratings)</p>
      </div>
    </div>
  `;
}
