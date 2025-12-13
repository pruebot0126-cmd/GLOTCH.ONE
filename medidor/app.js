// =======================
// INITIAL MAP SETUP
// =======================
const map = L.map("map").setView([19.4326, -99.1332], 13);

// Base Map
const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);

// Satellite Layer
const satelliteLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { maxZoom: 19 }
);

let satelliteMode = false;

// =======================
// DRAWING FEATURES
// =======================
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    polyline: true,
    rectangle: false,
    circle: false,
    marker: false
  },
  edit: {
    featureGroup: drawnItems
  }
});

map.addControl(drawControl);

let measureMode = false;
let measurePoints = [];

map.on("draw:created", function (e) {
  const layer = e.layer;
  drawnItems.addLayer(layer);

  // Enable dragging if supported
  if (layer.dragging) layer.dragging.enable();

  updateArea();
});

map.on("draw:edited", updateArea);

// =======================
// UPDATE AREA / DISTANCE
// =======================
function updateArea() {
  let totalArea = 0;

  drawnItems.eachLayer(layer => {
    if (layer.toGeoJSON().geometry.type === "Polygon") {
      totalArea += turf.area(layer.toGeoJSON());
    }
  });

  document.getElementById("area")?.textContent = totalArea.toFixed(2);
}

// =======================
// BUTTON HANDLERS
// =======================

// Toggle Satellite
document.getElementById("toggleSatelliteBtn").onclick = () => {
  if (satelliteMode) {
    map.removeLayer(satelliteLayer);
    map.addLayer(streetLayer);
  } else {
    map.removeLayer(streetLayer);
    map.addLayer(satelliteLayer);
  }
  satelliteMode = !satelliteMode;
};

// Measure Distance
document.getElementById("measureDistanceBtn").onclick = () => {
  measureMode = !measureMode;
  measurePoints = [];
  alert("Modo medir distancia: haz clic en el mapa para medir.");
};

map.on("click", function (e) {
  if (!measureMode) return;

  measurePoints.push([e.latlng.lng, e.latlng.lat]);

  if (measurePoints.length > 1) {
    const line = turf.lineString(measurePoints);
    const dist = turf.length(line, { units: "kilometers" });
    alert("Distancia: " + (dist * 1000).toFixed(1) + " m");
  }
});

// Save Shapes
document.getElementById("saveBtn").onclick = () => {
  const shapes = [];

  drawnItems.eachLayer(layer => {
    shapes.push(layer.toGeoJSON());
  });

  localStorage.setItem("glotch_shapes", JSON.stringify(shapes));
  alert("Formas guardadas.");
};

// Load Shapes
document.getElementById("loadBtn").onclick = () => {
  const data = localStorage.getItem("glotch_shapes");
  if (!data) return alert("No hay formas guardadas.");

  const shapes = JSON.parse(data);
  drawnItems.clearLayers();

  shapes.forEach(shape => {
    const layer = L.geoJSON(shape).addTo(drawnItems);

    // Enable dragging if supported
    if (layer.dragging) layer.dragging.enable();
  });
  alert("Formas cargadas.");
};
