const knex = require('knex');
const knexConfig = require('./knexfile');

const db = knex(knexConfig.development); // Use development environment

module.exports = db;
