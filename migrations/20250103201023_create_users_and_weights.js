/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('weights', (table) => {
        table.increments('id').primary(); // Optional: Unique ID
        table.float('weight').notNullable(); // Weight column
        table.date('date').notNullable(); // Date column
        table.timestamps(true, true); // created_at and updated_at
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('weights');
};
