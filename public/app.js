// app.js -- Decode METAR/TAF weather information from a weather API
// API Documentation can be found at https://apidocs.checkwx.com/
// Example: https://www.checkwx.com/weather/CYTZ


const API_KEY = '19b4970bb56b0460a4130b5b67';
const API_URL = 'https://api.checkwx.com/metar/';


// I'm Assuming window.fetch exists!
// TODO: get a polyfill for fetch
const parseAPIResponse = (airportCode, response) => {
  if (!response.ok) {
    throw new Error('ERROR: Network response was not ok');
  }

  return response.json()
    .then(responseJSON => {
      /*
      responseJSON looks like this:
      {
        "results": 1,
        "data": [
          "CYTZ 051900Z AUTO 17011KT 9SM CLR 29\/23 A3006 RMK SLP178 DENSITY ALT 1700FT"
        ]
      }
      */
      // Validate meta data
      if (!responseJSON.results || responseJSON.results !== 1) {
        throw new Error(`ERROR: Invalid number of results: found ${responseJSON.results} expected 1 (${airportCode})`);
      }
      // Ensure data exists and it is an array with only one item in it
      if (!responseJSON.data || responseJSON.data.length !== 1) {
        throw new Error(`ERROR: Invalid number of data entries: found ${JSON.stringify(responseJSON.data)} expected 1 (${airportCode})`)
      }
      // send the most recent result (I assume they're ordered chronologically)
      return responseJSON.data[responseJSON.data.length - 1];
    });
};


const getWeather = (airportCode) => {
  const url = API_URL + airportCode;
  const headers = new Headers({
    "Accept": "application/json",
    "X-API-Key": API_KEY
  });
  const options = {
    method: 'GET',
    headers: headers
  };
  return fetch(url, options)
    .then(parseAPIResponse.bind(null, airportCode));
};

const displayMETAR = (data) => {
  const el = document.getElementById('txtMetar');
  el.innerText = data;
};

const getRandomAirport = () =>
  fetch('./airport/random')
    .then(response => response.json())
    .then(data => getWeather(data.icao_code))
    .then(displayMETAR);

const excludeAirport = icao_code =>
  fetch(`./airport/${icao_code}/no-data`, { method: 'POST' });

const run = async() => {
  let fetching = true;
  let fetchCount = 0;
  while(fetching) {
    console.log('fetching an airport...');
    fetchCount++;
    await getRandomAirport()
      .then(() => { fetching = false; })
      .catch((errorMsg) => {
         const regex = /\((.*)\)$/;
         const airportCode = errorMsg.toString().match(regex)[1];
         fetching = true;
         console.log(`Error fetching ${airportCode}, retrying...`);
         excludeAirport(airportCode);
      })
  }
  console.log('fetchCount:', fetchCount);
};

//getWeather("CYWM").then(displayMETAR);
run();
