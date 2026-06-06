npm init -y -> create the package.json (so see all the libraries u installed)

.env file
process.env. uses dotenv package to retrieve the .env variables

joi asserts that input followsthe rules set by wtv

is NaN = is null ...

In the JavaScript validation library Joi, abortEarly is a configuration option that controls whether validation stops immediately after encountering the very first rule violation.

The path module is a built-in utility in backend and scripting environments (most notably Node.js) that provides tools for interacting with and manipulating file and directory paths. It automatically detects the operating system's rules to ensure your file paths work correctly anywhere.

Why Do You Need It?
Different operating systems use different path separators:Windows uses backslashes (\(\setminus \)).macOS and Linux (POSIX) use forward slash (\(/\)).If you hardcode paths using standard strings, your code may fail when moved to a different server or operating system. The path module handles all these differences for you, making your code highly portable.

express.static is a built-in middleware function in Express that serves static files—such as HTML, CSS, JavaScript, and images—directly to the browser. It eliminates the need to write custom routes for every single asset.
How it works
When a client requests a file, Express searches the designated directory. If the file exists, it is served as-is with the correct MIME type (e.g., text/css, image/png).It looks for files in the specified directory relative to the URL path requested by the client. For example, a request to /index.html will look for index.html inside the directory provided to express.static.

path.join(__dirname, 'public') creates the absolute path to your public folder. __dirname is a Node.js global variable that gives you the directory path of the currently executing script (app.js).
