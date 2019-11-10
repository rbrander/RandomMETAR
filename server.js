const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const port = 8080;
const BASE_URL = '/METAR';
const airports = require('./canadian_airports.json');

const EXCLUDED_AIRPORTS_FILENAME = 'excluded-airports.json';
const SAVED_METARS_FILENAME = 'saved-metars.json';
// used to store icao codes for airports with no METAR data
const excludedAirports = JSON.parse(fs.readFileSync(EXCLUDED_AIRPORTS_FILENAME, { encoding: 'utf8' }));

app.use((req, res, next) => {
  console.log(`incoming request ${req.url}`);
  return next();
});

app.use(bodyParser.text());

app.use('/METAR', express.static('public'));

app.get('/METAR/airport/random', (_, res) => {
  const includedAirports = airports.filter(airport => !excludedAirports.includes(airport.icao_code));
  const randomIndex = Math.floor(Math.random() * includedAirports.length);
  res.set('Content-Type', 'application/json');
  res.send(includedAirports[randomIndex])
  res.end();
});

app.post('/METAR/airport/:icao_code/no-data', (req, res) => {
  const { icao_code } = req.params;
  console.log(`No Data for ${icao_code}!`);
  excludedAirports.push(icao_code);
  fs.writeFileSync(EXCLUDED_AIRPORTS_FILENAME, JSON.stringify(excludedAirports, undefined, 2), { encoding: 'utf8' });
  res.status(200).end();
});

app.post('/METAR/airport/:icao_code/save', (req, res) => {
  const { icao_code } = req.params;
  console.log(`Saving ${req.body}`);
  const savedMETARList = JSON.parse(fs.readFileSync(SAVED_METARS_FILENAME, { encoding: 'utf8' }));
  savedMETARList.push(req.body);
  fs.writeFileSync(SAVED_METARS_FILENAME, JSON.stringify(savedMETARList, undefined, 2), { encoding: 'utf8' });
  res.status(200).end();
});

app.use((req, res) => res.status(404).end());

app.listen(port, () => console.log(`Server running on port ${port}`));
