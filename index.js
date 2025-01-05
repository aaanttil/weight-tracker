const express = require('express');
const knex = require('knex')(require('./knexfile').development);
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get('/users', async (req, res) => {
    const users = await knex('users').select('*');
    res.json(users);
});

app.post('/users', async (req, res) => {
    const { name } = req.body;
    const [id] = await knex('users').insert({ name });
    res.json({ id });
});

app.get('/weights/:userId', async (req, res) => {
    const { userId } = req.params;
    const weights = await knex('weights').where({ user_id: userId });
    res.json(weights);
});

app.post('/weights', async (req, res) => {
    const { user_id, weight, date } = req.body;
    const [id] = await knex('weights').insert({ user_id, weight, date });
    res.json({ id });
});

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});
