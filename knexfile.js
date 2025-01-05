// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './weight-tracker.db', // SQLite database file
    },
    useNullAsDefault: true, // Required for SQLite to avoid warnings
    migrations: {
      directory: './migrations', // Directory for migration files
    },
    seeds: {
      directory: './seeds', // Optional: Directory for seed files
    },
  },
};
