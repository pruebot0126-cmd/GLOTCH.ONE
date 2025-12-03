// MAPA BASE
const map = L.map("map").setView([19.4326, -99.1332], 14);

const streetLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
).addTo(map);

const satelliteLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
);

let satelliteMode = false;

// CAPA PARA FORMAS
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// CONTROL PARA DIBUJAR
const drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    polyline: true,
    rectangle: true,
    marker: false,
    circle: false,
    circlemarker: false
  },
  edit: {
    featureGroup: drawnItems
  }
});

map.addControl(drawControl);

// === ACTIVAR ARRASTRE (path.drag) ===
function enableDrag(layer) {
  if (layer.dragging) {
    layer.dragging.enable();
  } else if (layer.eachLayer) {
    layer.eachLayer(l => {
      if (l.dragging) l.dragging.enable();
    });
  }
}

// === MEDIR DISTANCIA ===
function measureDistance(layer) {
  if (layer instanceof L.Polyline) {
    const latlngs = layer.getLatLngs();
    let meters = 0;

    for (let i = 0; i < latlngs.length - 1; i++) {
      meters += latlngs[i].distanceTo(latlngs[i + 1]);
    }

    alert("Distancia: " + meters.toFixed(2) + " metros");
  }
}

// === ROTAR FIGURAS (multi-touch y mouse) ===
function enableRotation(layer) {
  let rotating = false;
  let startAngle = 0;

  layer.on("mousedown touchstart", e => {
    rotating = true;
    startAngle = map.mouseEventToContainerPoint(e.originalEvent);
  });

  map.on("mousemove touchmove", e => {
    if (!rotating) return;

    let current = map.mouseEventToContainerPoint(e.originalEvent);
    let angle = current.x - startAngle.x;

    layer.setRotationAngle(angle);
  });

  map.on("mouseup touchend", () => {
    rotating = false;
  });
}

// CUANDO SE CREA UNA NUEVA FIGURA
map.on("draw:created", function (e) {
  const layer = e.layer;
  drawnItems.addLayer(layer);

  enableDrag(layer);
  enableRotation(layer);
});

// GUARDAR FORMAS
function saveShape() {
  const data = drawnItems.toGeoJSON();
  localStorage.setItem("shapes", JSON.stringify(data));
  alert("Formas guardadas");
}

// CARGAR FORMAS
function loadShapes() {
  const data = localStorage.getItem("shapes");
  if (!data) return alert("No hay formas guardadas");

  drawnItems.clearLayers();
  L.geoJSON(JSON.parse(data)).eachLayer(layer => {
    drawnItems.addLayer(layer);
    enableDrag(layer);
    enableRotation(layer);
  });

  alert("Formas cargadas y movibles");
}

// CAMBIAR A SATÉLITE
function toggleSatellite() {
  if (satelliteMode) {
    map.removeLayer(satelliteLayer);
    streetLayer.addTo(map);
  } else {
    map.removeLayer(streetLayer);
    satelliteLayer.addTo(map);
  }
  satelliteMode = !satelliteMode;
}
