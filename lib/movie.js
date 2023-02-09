'use strict';

const axios = require('axios');
const cache = require('./cache');

function getMovie(req, res, next) {
  const MOVIE_CACHE_KEY = 'movie';
  const MOVIE_API_BASE_URL = 'https://api.themoviedb.org/';
  const MOVIE_API_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/original';
  
  const city = req.query.city;

  const movieDataUrl = new URL('/3/search/movie',MOVIE_API_BASE_URL);
  movieDataUrl.searchParams.set('api_key', process.env.MOVIE_API_KEY);
  movieDataUrl.searchParams.set('include_adult','false');
  movieDataUrl.searchParams.set('query', city);
  
  // We only want to return the top 20 movies in our response. The page query returns a number of pages, with each page return a maximum of 20 results.
  movieDataUrl.searchParams.set('page', 1);

  // We'll set the reset on the movie cache data to be a day
  const cacheLife = 86400000;
  if (cache[MOVIE_CACHE_KEY][city] && (Date.now() - cache[MOVIE_CACHE_KEY][city].timestamp < cacheLife)) {
    // Cache hit
    cache[MOVIE_CACHE_KEY][city].timestamp = Date.now();
    res.status(200).send(cache[MOVIE_CACHE_KEY][city].data);
  } else {
    // Cache miss
    cache[MOVIE_CACHE_KEY][city] = {}
    cache[MOVIE_CACHE_KEY][city].timestamp = Date.now();
    axios.get(movieDataUrl)
      .then(resData => {
        const filteredMovieData = resData.data.results.map(movie => {
          return new Movie(movie, MOVIE_API_POSTER_BASE_URL);
        });
        cache[MOVIE_CACHE_KEY][city].data = filteredMovieData;
        res.status(200).send(cache[MOVIE_CACHE_KEY][city].data);
      })
      .catch(error => next(error));
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

module.exports = getMovie;