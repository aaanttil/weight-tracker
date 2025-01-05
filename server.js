const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db'); // Import Knex configuration

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Get all weights
app.get('/api/weights', async (req, res) => {
  try {
    const weights = await db('weights').select('*').orderBy('date', 'asc');
    res.json(weights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch weights' });
  }
});

// Add a new weight
app.post('/api/weights', async (req, res) => {
  try {
    const { weight, date } = req.body;
    if (!weight || !date) {
      return res.status(400).json({ error: 'Weight and date are required' });
    }

    const [id] = await db('weights').insert({ weight, date });
    const newWeight = await db('weights').where({ id }).first();
    res.status(201).json(newWeight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add weight' });
  }
});

// Edit an existing weight
app.put('/api/weights/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { weight, date } = req.body;

    if (!weight || !date) {
      return res.status(400).json({ error: 'Weight and date are required' });
    }

    const updatedWeight = await db('weights')
      .where({ id })
      .update({ weight, date })
      .returning('*');

    if (updatedWeight.length === 0) {
      return res.status(404).json({ error: 'Weight entry not found' });
    }

    res.json(updatedWeight[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update weight' });
  }
});

// Delete a weight entry
app.delete('/api/weights/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedWeight = await db('weights').where({ id }).del().returning('*');

    if (deletedWeight.length === 0) {
      return res.status(404).json({ error: 'Weight entry not found' });
    }

    res.json({ message: 'Weight entry deleted successfully', deletedWeight: deletedWeight[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete weight' });
  }
});

// Start the server
const PORT = 3001; // Port for backend
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
