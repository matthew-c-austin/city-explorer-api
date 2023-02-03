'use strict'

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3002;

app.get('/', (req, res) => {
  res.send('Hey your server is up and running!');
});

app.get('/weather', getWeather);

async function getWeather(req, res, next) {
  const lat = req.query.lat;
  const lon = req.query.lon;
  const WEATHERBIT_API_BASE_URL = 'http://api.weatherbit.io/v2.0/forecast/daily';
  
  const weatherDataUrl = new URL(WEATHERBIT_API_BASE_URL);
  weatherDataUrl.searchParams.set('key', process.env.WEATHER_API_KEY);
  weatherDataUrl.searchParams.set('lat', lat);
  weatherDataUrl.searchParams.set('lon', lon);
  weatherDataUrl.searchParams.set('days', 3);
  
  try {
    const response = await axios.get(weatherDataUrl)
    const resData = response.data.data.map(day => {
      return new Forecast(day.datetime, day.weather.description);
    });
    res.status(200).send(resData);
  } catch(error) {
    next(error)
  }  
}

class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description;
  }
}

app.get('/movie', getMovie);

async function getMovie(req, res, next) {
  const city = req.query.city;
  const MOVIE_API_BASE_URL = 'https://api.themoviedb.org/';
  const MOVIE_API_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/original';
  
  const movieDataUrl = new URL('/3/search/movie',MOVIE_API_BASE_URL);
  movieDataUrl.searchParams.set('api_key', process.env.MOVIE_API_KEY);
  movieDataUrl.searchParams.set('include_adult','false');
  movieDataUrl.searchParams.set('query', city);
  
  // We only want to return the top 20 movies in our response. The page query returns a number of pages, with each page return a maximum of 20 results.
  movieDataUrl.searchParams.set('page', 1);
  try {
    const response = await axios.get(movieDataUrl)
    const resData = response.data.results.map(movie => {
      return new Movie(movie, MOVIE_API_POSTER_BASE_URL);
    });
    res.status(200).send(resData);
  } catch(error) {
    next(error)
  }  
}

class Movie {
  constructor(movie, baseUrl) {
    this.title = movie.title;
    this.overview = movie.overview;
    this.average_votes = movie.vote_average;
    this.total_vote = movie.vote_count;
    movie.poster_path === null ? null : this.image_url = `${baseUrl}${movie.poster_path}`;
    this.popularity = movie.popularity;
    this.released_on = movie.release_date;
  }
}

app.listen(PORT, ()=> console.log(`Listening on Port ${PORT}`));