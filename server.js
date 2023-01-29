'use strict'

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const weatherData = require('./data/weather.json');
const { response } = require('express');
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3002;

app.get('/', (req, res) => {
  res.send('Hey your default endpoint is working');
});

app.listen(PORT, ()=> console.log(`listening on Port ${PORT}`));

app.get('/weather', (req, res, next) => {
  try {
    const lat = req.query.lat;
    const lon = req.query.lon;
    const searchQuery = req.query.searchQuery;
    const filteredWeatherData = new WeatherData(lat, lon, searchQuery);
    const resData = filteredWeatherData.getData();
    res.status(200).send(resData);
  } catch(error) {
    next(error)
  }  
});

class WeatherData{
  constructor(lat=null, lon=null, searchQuery=null) {
    console.log('lat', lat);
    console.log('lon', lon);
    console.log('searchQuery', searchQuery);
    this.resData = weatherData.find(location => location.city_name === searchQuery || location.lat === lat && location.lon === lon)
  }

  getData(){
    return this.resData.data.map(day => {
      return new Forecast(day.datetime, day.weather.description);
    });
  }
}

class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description;
  }
}

app.use((error, req, res, next) => {
  if (error instanceof TypeError) {
    res.status(400).send({error: `Bad Request. We can't find that city!`});
  }
});
