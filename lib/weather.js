'use strict';

const axios = require('axios');
const cache = require('./cache');

function getWeather(req, res, next) {
  const WEATHER_CACHE_KEY = 'weather';
  const WEATHERBIT_API_BASE_URL = 'http://api.weatherbit.io/v2.0/forecast/daily';

  const lat = req.query.lat;
  const lon = req.query.lon;
  const coords = `${lat},${lon}`;
  
  const weatherDataUrl = new URL(WEATHERBIT_API_BASE_URL);
  weatherDataUrl.searchParams.set('key', process.env.WEATHER_API_KEY);
  weatherDataUrl.searchParams.set('lat', lat);
  weatherDataUrl.searchParams.set('lon', lon);
  weatherDataUrl.searchParams.set('days', 3);
  
  // We'll set the reset on the weather data to be an hour
  const cacheLife = 3600000;
  if (cache[WEATHER_CACHE_KEY][coords] && (Date.now() - cache[WEATHER_CACHE_KEY][coords].timestamp < cacheLife)) {
    // Cache hit
    cache[WEATHER_CACHE_KEY][coords].timestamp = Date.now();
    res.status(200).send(cache[WEATHER_CACHE_KEY][coords].data);
  } else {
    // Cache miss
    cache[WEATHER_CACHE_KEY][coords] = {}
    cache[WEATHER_CACHE_KEY][coords].timestamp = Date.now();
    axios.get(weatherDataUrl)
      .then(resData => {
        const formattedWeatherData = resData.data.data.map(day => {
          return new Forecast(day.datetime, day.weather.description);
        })
        cache[WEATHER_CACHE_KEY][coords].data = formattedWeatherData;
        res.status(200).send(cache[WEATHER_CACHE_KEY][coords].data);
      })
      .catch(error => next(error));
  }
}

class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description;
  }
}

module.exports = getWeather;