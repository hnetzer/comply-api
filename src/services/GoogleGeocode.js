import fetch from 'node-fetch';

const GOOGLE_API_KEY = "AIzaSyCbN2Mnp6f3QTborwTZUu8saFLP_l6ph5o"
const GOOGLE_GEOCODE_BASE_API = "https://maps.googleapis.com/maps/api/geocode/json"


const getAddressComponents = async (office) => {
  const search = encodeURIComponent(`${office.address} ${office.city}, ${office.state} ${office.zip}`)
  const requestURL = `${GOOGLE_GEOCODE_BASE_API}?address=${search}&key=${GOOGLE_API_KEY}`
  console.log(requestURL)
  const response = await fetch(requestURL)

  // Check for error codes
  if (response.status !== 200) {
    let error = await response.json()
    const msg = "Error getting address details from Google";
    console.error(msg, error)
    throw `${msg} ${searchResponse.status}`
  }

  let searchResponse = await response.json()
  if (searchResponse.status != "OK") {
    const msg = "Error response from Google Geocode API"
    console.error(msg, searchResponse.status)
    throw `${msg} ${searchResponse.status}`
  }

  // We are only going to check the first address
  const result = searchResponse.results[0];
  return result.address_components;
}


const parseAddressComponents = (address_components) => {
  let city = null;
  let state = null;
  let county = null;

  address_components.forEach((component, index) => {
    for (let i=0; i < component.types.length; i++) {
      const type = component.types[i];

      // Check for the city
      if (type === "locality") {
        city = component.long_name;
        break;
      }
      // Check for the county
      if (type === "administrative_area_level_2") {
        county = component.long_name;
        break;
      }

      //  Check for the state
      if (type === "administrative_area_level_1") {
        state = component.long_name;
        break;
      }
    }
  })

  const addressComponents = { city: city, county: county, state: state };
  console.log("Parsed the following address components", addressComponents)
  return addressComponents
}

export default {
  getAddressComponents,
  parseAddressComponents
}
