const booksListDiv = document.getElementById("booksList");
const fetchBooksBtn = document.getElementById("fetchBooksBtn");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

// Fetch all books from the API and display them
async function fetchBooks() {
  try {
    booksListDiv.innerHTML = "Loading books...";
    messageDiv.textContent = "";

    const response = await fetch(`${apiBaseUrl}/books`);

    if (!response.ok) {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      );
    }

    const books = await response.json();

    booksListDiv.innerHTML = "";
    if (books.length === 0) {
      booksListDiv.innerHTML = "<p>No books found.</p>";
    } else {
      books.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book-item");
        bookElement.setAttribute("data-book-id", book.id);
        bookElement.innerHTML = `
          <h3>${book.title}</h3>
          <p>Author: ${book.author}</p>
          <p>ID: ${book.id}</p>
          <button onclick="viewBookDetails(${book.id})">View Details</button>
          <button onclick="editBook(${book.id})">Edit</button>
          <button class="delete-btn" data-id="${book.id}">Delete</button>
        `;
        booksListDiv.appendChild(bookElement);
      });

      // Attach delete handlers after all elements are in the DOM
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    booksListDiv.innerHTML = `<p style="color: red;">Failed to load books: ${error.message}</p>`;
  }
}

// GET single book by ID and show details in an alert
async function viewBookDetails(bookId) {
  try {
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`);

    if (!response.ok) {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      );
    }

    const book = await response.json();
    alert(`Book Details\n\nID: ${book.id}\nTitle: ${book.title}\nAuthor: ${book.author}`);
  } catch (error) {
    console.error("Error fetching book details:", error);
    messageDiv.textContent = `Failed to load book details: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

// Navigate to edit page
function editBook(bookId) {
  window.location.href = `edit.html?id=${bookId}`;
}

// DELETE a book and remove it from the DOM on success
async function handleDeleteClick(event) {
  const bookId = event.target.getAttribute("data-id");

  if (!confirm(`Are you sure you want to delete book ID: ${bookId}?`)) {
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      // Remove the book element from the DOM
      const bookElement = document.querySelector(
        `.book-item[data-book-id="${bookId}"]`
      );
      if (bookElement) {
        bookElement.remove();
      }
      messageDiv.textContent = `Book ID ${bookId} deleted successfully.`;
      messageDiv.style.color = "green";
    } else if (response.status === 404) {
      messageDiv.textContent = `Book ID ${bookId} not found.`;
      messageDiv.style.color = "red";
    } else {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `API error! status: ${response.status}, message: ${errorBody.message}`
      );
    }
  } catch (error) {
    console.error("Error deleting book:", error);
    messageDiv.textContent = `Failed to delete book: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

// Fetch books on button click
fetchBooksBtn.addEventListener("click", fetchBooks);

// Auto-load books when page opens
fetchBooks();
