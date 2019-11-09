const express = require('express');
const app = express();
const fs = require('fs');
const port = 8080;
const BASE_URL = '/METAR';
const airports = require('./canadian_airports.json');

const excludedAirports = []; // used to store icao codes for airports with no METAR data

app.use((req, res, next) => {
  console.log(`incoming request ${req.url}`);
  return next();
});

app.use('/METAR', express.static('public'));

app.get('/METAR/airport/random', (_, res) => {
  const includedAirports = airports.filter(airport => !excludedAirports.includes(airport.icao_code));
  const randomIndex = Math.floor(Math.random() * includedAirports.length);
  res.set('Content-Type', 'application/json');
  res.send(includedAirports[randomIndex]);
});

app.post('/METAR/airport/:icao_code/no-data', (req, res) => {
  const { icao_code } = req.params;
  console.log(`No Data for ${icao_code}!`);
  excludedAirports.push(icao_code);
  // TODO: put the code into persistant storage (e.g. a file or database)
  console.log('excludedAirports:\n',JSON.stringify(excludedAirports, undefined, 2));
});

app.use((req, res) => res.status(404).end());

app.listen(port, () => console.log(`Server running on port ${port}`));
