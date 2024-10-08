import * as ALL from "./countries.js";
import * as shared from "./shared.js";

const ZOOM = 7;
let coordinates = [51.505, -0.09];
let headerEl = document.querySelector("header");
let formEl = document.querySelector('form')
let strokes = [];

// Initialize map
let map = L.map("map", {
  dragging: window.__devMode ?? false,
  scrollWheelZoom: window.__devMode ?? false,
  zoomControl: window.__devMode ?? false,
}).setView(coordinates, ZOOM);
L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
L.marker(coordinates).addTo(map).bindPopup("<b>Tee</b>").openPopup();

// Select the target country
const { LIST, ...COUNTRY_DATA } = ALL;
let DATA = COUNTRY_DATA[LIST[Math.floor(Math.random() * LIST.length)]];
console.log(">>> DATA", DATA);
headerEl.textContent = DATA.properties.name;
L.geoJSON(
  { type: "FeatureCollection", features: [DATA] },
  {
    style: shared.HIGHLIGHTED_STYLE,
  }
).addTo(map);
let tStart = turf.point([coordinates[1], coordinates[0]]);
let center = turf.centerOfMass(DATA);
let tCenter = turf.point(center.geometry.coordinates);
L.marker([center.geometry.coordinates[1], center.geometry.coordinates[0]])
  .addTo(map)
  .bindPopup(`<b>${DATA.properties.name}</b>`);

formEl.addEventListener("submit", e => {
    e.preventDefault();
    let fd = new FormData(e.target)
    let distance = parseFloat(fd.get("distance"))
    let direction = fd.get("direction")

    switch (direction) {
        case "N": {
            coordinates[0] += distance / shared.MILES_PER_LATITUDE
            break;
        }
        case "NE": {
            let leg = getLegLength(distance)
            coordinates[0] += leg / shared.MILES_PER_LATITUDE
            coordinates[1] += leg / shared.MILES_PER_LONGITUDE
            break;
        }
        case "E": {
            coordinates[1] += distance / shared.MILES_PER_LONGITUDE
            break;
        }
        case "SE": {
            let leg = getLegLength(distance)
            coordinates[0] -= leg / shared.MILES_PER_LATITUDE
            coordinates[1] += leg / shared.MILES_PER_LONGITUDE
            break;
        }
        case "S": {
            coordinates[0] -= distance / shared.MILES_PER_LATITUDE
            break;
        }
        case "SW": {
            let leg = getLegLength(distance)
            coordinates[0] -= leg / shared.MILES_PER_LATITUDE
            coordinates[1] -= leg / shared.MILES_PER_LONGITUDE
            break;
        }
        case "W": {
            coordinates[1] -= distance / shared.MILES_PER_LONGITUDE
            break;
        }
        case "NW": {
            let leg = getLegLength(distance)
            coordinates[0] += leg / shared.MILES_PER_LATITUDE
            coordinates[1] -= leg / shared.MILES_PER_LONGITUDE
            break;
        }
    }

    strokes.push(Array.from(coordinates))

    console.log(coordinates)
    map.flyTo(coordinates, ZOOM)
    L.marker(coordinates).addTo(map).bindPopup(`<b>Stroke ${strokes.length}</b>`).openPopup()

    let tPoint = turf.point([coordinates[1], coordinates[0]]);
    console.log(">>> point", tPoint)
    console.log(">>> distance (w/conversation)", turf.distance(tPoint, tCenter, { units: "miles" }))

    // TODO: Clean this up
    let isInside = false
    try {
        let polygon = turf.polygon(DATA.geometry.coordinates)
        isInside = turf.booleanPointInPolygon(tPoint, polygon)
    } catch {
        isInside = DATA.geometry.coordinates.some(coords => {
            let polygon = turf.polygon(coords);
            console.log(">>>", polygon)
            return turf.booleanPointInPolygon(tPoint, polygon);
        })
    }
    // END TODO

    console.log(">>> isInside", isInside)
    printMessage();
    if (isInside) {
        headerEl.textContent = `You won in ${strokes.length} strokes!`
    }
})

function getLegLength(hypotenuse) {
    // a^2 + b^2 = c^2; a = b
    // a^2 + a^2 = c^2
    // 2a^2 = c^2
    // a^2 = (c^2)/2
    // a = sqrt((c^2)/2)
    return Math.sqrt(Math.pow(hypotenuse, 2) / 2)
}

let totalDistance = turf.distance(tStart, tCenter, { units: "miles" })
function printMessage() {
    let message = ""
    for (let i = 0; i < strokes.length; i++) {
        let stroke = strokes[i]
        let distance = turf.distance(turf.point([stroke[1], stroke[0]]), tCenter, { units: "miles" })
        message += `Stroke ${i + 1}: ${((totalDistance - distance) / totalDistance * 100).toFixed(2)}%\n`
    }
    console.log(message)
}