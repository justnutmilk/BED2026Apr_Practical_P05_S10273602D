const createBookForm = document.getElementById("createBookForm");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

createBookForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default browser form submission

  messageDiv.textContent = "";

  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");

  const newBookData = {
    title: titleInput.value,
    author: authorInput.value,
  };

  try {
    const response = await fetch(`${apiBaseUrl}/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBookData),
    });

    const responseBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    if (response.status === 201) {
      messageDiv.textContent = `Book created successfully! ID: ${responseBody.id}`;
      messageDiv.style.color = "green";
      createBookForm.reset();
      console.log("Created Book:", responseBody);
    } else if (response.status === 400) {
      messageDiv.textContent = `Validation Error: ${responseBody.error}`;
      messageDiv.style.color = "red";
      console.error("Validation Error:", responseBody);
    } else {
      throw new Error(
        `API error! status: ${response.status}, message: ${responseBody.message}`
      );
    }
  } catch (error) {
    console.error("Error creating book:", error);
    messageDiv.textContent = `Failed to create book: ${error.message}`;
    messageDiv.style.color = "red";
  }
});
