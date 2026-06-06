# Practical 05: Part B - Homework Reflection

## Task 2: Reflection and Review

### 1. Separation of Concerns

**Distinct responsibilities of Model, View, and Controller:**

- **Model** (`models/studentModel.js`): Responsible solely for data access. It contains all the SQL queries that talk directly to the database — fetching, inserting, updating, and deleting records. It knows nothing about HTTP requests or how data will be displayed. It just retrieves or modifies data and returns it.

- **View** (`public/*.html` + `public/*.js`): The external frontend that the user sees and interacts with in the browser. It is responsible for displaying data and collecting user input. It communicates with the backend only through HTTP requests (fetch API) and has no knowledge of how the database works or how the server is structured.

- **Controller** (`controllers/studentController.js`): Acts as the bridge between the Model and the View. It receives HTTP requests, calls the appropriate model functions to get or modify data, and then sends back the correct HTTP response (with status codes and JSON data). It handles request/response logic but does not contain any SQL or HTML.

**How a separate frontend View simplifies the backend API:**

Having a separate frontend means the backend API only needs to return clean JSON data — it does not need to generate or return any HTML. This makes the API simpler, more focused, and reusable. The same API can serve a web browser, a mobile app, or any other client without any changes to the backend. The backend just handles data; the frontend handles display.

---

### 2. Robustness and Security

It became significantly easier to identify and fix bugs at the **Practical 04 stage**, when MVC architecture, validation middleware, error handling, and parameterized queries were introduced.

- In Practical 03, all logic was in one file (`app.js`). When something broke, it was hard to pinpoint whether the issue was in the routing, the database query, or the response formatting.
- In Practical 04, the separation of concerns meant bugs were easier to isolate: a wrong response format was a controller issue, a bad SQL result was a model issue, and invalid input was a middleware issue.
- In Practical 05, adding the frontend revealed new categories of bugs, such as mismatched response fields. Having the Network tab in browser DevTools made these very visible, showing exactly what was sent and received.

Parameterized queries also eliminated a whole class of potential security bugs (SQL injection) from Practical 04 onwards, which would have been very hard to detect just by testing manually.

---

### 3. Challenges and Problem Solving

**Most challenging aspect:**

The most challenging part across the three practicals was understanding how data flows between layers — specifically, how a request travels from the browser, through the route, into the controller, down to the model, back up to the controller, and finally to the browser as a response. At first it felt like a lot of indirection for something simple, but once I traced through a full request cycle manually (e.g., a POST to create a student), the pattern clicked and became easy to follow for subsequent features.

**Adding a new feature in MVC with a View layer:**

If I needed to add a "course" field to students, the MVC structure makes it very clear what to change:
1. **Model**: Update the SQL `INSERT` and `UPDATE` queries to include `course`.
2. **Middleware**: Add `course` as a validated field in the Joi schema.
3. **Controller**: No changes needed — it already passes `req.body` to the model.
4. **View**: Add a new `<input>` field for `course` in `create-student.html` and `edit-student.html`, and update the JS files to include it in the request body.

In contrast, in the Practical 03 structure, all of this would be tangled together in `app.js`, making it easy to accidentally break existing functionality while adding the new field.

---

### 4. Experiential Learning

Reading about MVC, parameterized queries, and validation gives a surface-level understanding — you know what they are but not why they matter. Actually building the project across three practicals made these concepts concrete:

- **MVC**: When I physically moved code out of `app.js` into separate model, controller, and middleware files, I felt the benefit immediately — the files became shorter, more readable, and easier to navigate.
- **Parameterized queries**: Writing `request.input("id", id)` instead of string concatenation felt more verbose at first, but understanding that it prevents SQL injection made it feel essential rather than optional.
- **Validation**: Seeing the Joi middleware reject a request with a clear error message before it even reached the controller showed how much cleaner the controller code becomes when it can assume the data is already valid.
- **Error handling**: Catching errors at each layer and returning generic messages to the client (while logging details server-side) felt overly cautious until I thought about what a stack trace leaking to a user actually exposes.

Hands-on coding made these not just concepts to memorise, but habits that feel natural to apply.
