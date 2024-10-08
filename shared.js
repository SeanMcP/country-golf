export const HIGHLIGHTED_STYLE = {
  color: "#ff7800",
  weight: 5,
  opacity: 0.65,
};

export const MILES_PER_LATITUDE = 69;
export const MILES_PER_LONGITUDE = 54.6;

export function addTileLayer(map) {
  L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.{ext}",
    {
      minZoom: 0,
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ext: "png",
    }
  ).addTo(map);
}
