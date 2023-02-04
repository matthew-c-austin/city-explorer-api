'use strict'

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const getWeather = require('./lib/weather');
const getMovie = require('./lib/movie');

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3002;

app.get('/', (req, res) => {
  res.send('Hey your server is up and running!');
});
app.get('/weather', getWeather);
app.get('/movie', getMovie);

app.listen(PORT, ()=> console.log(`Listening on Port ${PORT}`));