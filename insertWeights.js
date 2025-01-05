const knex = require('./db'); // Adjust path to your db.js file

async function insertWeights() {
  try {
    await knex('weights').insert([
      { weight: 108.8, date: '2024-12-31' },
      { weight: 105.9, date: '2025-01-03' },
    ]);
    console.log('Data inserted successfully!');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    knex.destroy();
  }
}

insertWeights();
