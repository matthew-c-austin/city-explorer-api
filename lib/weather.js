'use strict';

const axios = require('axios');

function getWeather(req, res, next) {
  const lat = req.query.lat;
  const lon = req.query.lon;
  const WEATHERBIT_API_BASE_URL = 'http://api.weatherbit.io/v2.0/forecast/daily';
  
  const weatherDataUrl = new URL(WEATHERBIT_API_BASE_URL);
  weatherDataUrl.searchParams.set('key', process.env.WEATHER_API_KEY);
  weatherDataUrl.searchParams.set('lat', lat);
  weatherDataUrl.searchParams.set('lon', lon);
  weatherDataUrl.searchParams.set('days', 3);
  
  axios.get(weatherDataUrl)
    .then(resData => {
      const formattedWeatherData = resData.data.data.map(day => {
        return new Forecast(day.datetime, day.weather.description);
      })
      res.status(200).send(formattedWeatherData);
    })
    .catch(error => next(error));
}

class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description;
  }
}

module.exports = getWeather;