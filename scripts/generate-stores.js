const fs = require('fs/promises');
const path = require('path');

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const REQUEST_DELAY_MS = 1000;
const OUTPUT_PATH = path.resolve(process.cwd(), 'src', 'data', 'stores.json');

const stores = [
  'Avondale, AZ', 'Chandler, AZ', 'Mesa, AZ', 'Alameda, CA', 'Anaheim, CA',
  'Arcadia, CA', 'Azusa, CA', 'Bakersfield, CA', 'Brea, CA', 'Burbank, CA',
  'Chino Hills, CA', 'Corona, CA', 'Costa Mesa, CA', 'Culver City, CA',
  'Cupertino, CA', 'Downey, CA', 'Fontana, CA', 'Fremont, CA', 'Fresno, CA',
  'Fullerton, CA', 'Garden Grove, CA', 'Gardena, CA', 'Hayward, CA',
  'Huntington Beach, CA', 'Inglewood, CA', 'Irvine, CA', 'La Habra, CA',
  'Laguna Hills, CA', 'Lake Forest, CA', 'Lakewood, CA', 'Lancaster, CA',
  'Long Beach, CA', 'Los Angeles, CA', 'Manhattan Beach, CA', 'Milpitas, CA',
  'Mission Viejo, CA', 'Monrovia, CA', 'Montebello, CA', 'Moreno Valley, CA',
  'Mountain View, CA', 'Norwalk, CA', 'Ontario, CA', 'Orange, CA', 'Palmdale, CA',
  'Pasadena, CA', 'Perris, CA', 'Pomona, CA', 'Rancho Cucamonga, CA',
  'Redlands, CA', 'Redondo Beach, CA', 'Riverside, CA', 'Rowland Heights, CA',
  'San Bernardino, CA', 'San Clemente, CA', 'San Diego, CA', 'San Dimas, CA',
  'San Gabriel, CA', 'San Jose, CA', 'Santa Ana, CA', 'Santa Barbara, CA',
  'Santa Monica, CA', 'Seal Beach, CA', 'Sherman Oaks, CA', 'Simi Valley, CA',
  'South Gate, CA', 'Stockton, CA', 'Torrance, CA', 'Tustin, CA', 'Valencia, CA',
  'Visalia, CA', 'Walnut, CA', 'Walnut Creek, CA', 'West Covina, CA',
  'Westlake Village, CA', 'Yorba Linda, CA', 'Arvada, CO', 'Centennial, CO',
  'Denver, CO', 'Littleton, CO', 'Baton Rouge, LA', 'Lafayette, LA',
  'New Orleans, LA', 'Hamilton, NJ', 'Henderson, NV', 'Las Vegas, NV',
  'Carrollton, TX', 'Cypress, TX', 'Dallas, TX', 'Fort Worth, TX', 'Garland, TX',
  'Houston, TX', 'Plano, TX', 'Southlake, TX', 'Sugar Land, TX',
  'Orem, UT', 'St. George, UT', 'West Jordan, UT'
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function roundCoord(value) {
  return Number(Number.parseFloat(value).toFixed(6));
}

async function fetchCoordinates(query) {
  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'yogurtland-store-geocoder/1.0',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed (${response.status}) for "${query}"`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return {
    lat: roundCoord(data[0].lat),
    lon: roundCoord(data[0].lon)
  };
}

async function main() {
  const results = [];

  for (let i = 0; i < stores.length; i += 1) {
    const name = stores[i];
    if (i > 0) {
      await sleep(REQUEST_DELAY_MS);
    }

    try {
      const coords = await fetchCoordinates(name);
      if (!coords) {
        console.warn(`[${i + 1}/${stores.length}] No match: ${name}`);
        results.push({ name, lat: null, lon: null });
        continue;
      }

      console.log(`[${i + 1}/${stores.length}] OK: ${name} -> ${coords.lat}, ${coords.lon}`);
      results.push({ name, lat: coords.lat, lon: coords.lon });
    } catch (error) {
      console.error(`[${i + 1}/${stores.length}] ERROR: ${name}`);
      console.error(error.message);
      results.push({ name, lat: null, lon: null });
    }
  }

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(results, null, 2)}\n`, 'utf8');
  console.log(`Saved ${results.length} stores to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
