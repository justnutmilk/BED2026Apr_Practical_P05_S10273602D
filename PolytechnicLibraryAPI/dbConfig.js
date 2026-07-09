// Database connection configuration for mssql.
// Values are read from the .env file (never hard-code credentials).
module.exports = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  trustServerCertificate: true,
  options: {
    port: parseInt(process.env.DB_PORT), // SQL Server port
    connectionTimeout: 60000, // Connection timeout in milliseconds
  },
};
