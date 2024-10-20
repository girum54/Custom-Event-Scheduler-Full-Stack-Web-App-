const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "database",
  database: "event_scheduler",
  password: "root",
  port: 5432,
});

module.exports = pool;
