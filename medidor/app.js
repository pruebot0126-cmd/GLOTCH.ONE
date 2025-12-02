// MAPA BASE
const map = L.map("map").setView([19.4326, -99.1332], 14);

const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
  .addTo(map);

const satelliteLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
);

let satelliteMode = false;

// DIBUJAR POLÍGONOS
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    rectangle: false,
    polyline: false,
    circle: false,
    marker: false
  },
  edit: { featureGroup: drawnItems }
});

map.addControl(drawControl);

// VARIABLES
let savedShapes = [];
let currentLayer = null;

// NUEVA FIGURA
map.on("draw:created", function(e) {
  let layer = e.layer;
  layer.addTo(drawnItems);

  if (layer.dragging) layer.dragging.enable();

  currentLayer = layer;

  updateArea(layer.toGeoJSON());
});

// ACTUALIZAR ÁREA
function updateArea(geojson) {
  const area = turf.area(geojson);
  document.getElementById("area").textContent = area.toFixed(2);
  document.getElementById("hectareas").textContent = (area / 10000).toFixed(4);
}

// GUARDAR
function saveShape() {
  if (!currentLayer) return alert("Dibuja una forma primero.");

  savedShapes.push(currentLayer.toGeoJSON());
  localStorage.setItem("glotch_shapes", JSON.stringify(savedShapes));

  alert("Forma guardada.");
}

// CARGAR
function loadShapes() {
  const data = localStorage.getItem("glotch_shapes");
  if (!data) return alert("No hay formas guardadas.");

  savedShapes = JSON.parse(data);
  drawnItems.clearLayers();

  savedShapes.forEach(shape => {
    let layer = L.geoJSON(shape).addTo(drawnItems);

    layer.eachLayer(l => {
      if (l.dragging) l.dragging.enable();
    });
  });

  alert("Formas cargadas y movibles.");
}

// SATÉLITE
function toggleSatellite() {
  if (satelliteMode) {
    map.removeLayer(satelliteLayer);
    map.addLayer(streetLayer);
  } else {
    map.removeLayer(streetLayer);
    map.addLayer(satelliteLayer);
  }
  satelliteMode = !satelliteMode;
}
