L.Control.Measure = L.Control.extend({
    onAdd: function(map) {
        const btn = L.DomUtil.create("button", "measure-btn");
        btn.innerHTML = "📏";
        btn.title = "Medir distancia";

        let points = [];
        let line = null;

        L.DomEvent.on(btn, "click", () => {
            map.on("click", e => {
                points.push(e.latlng);

                if (points.length === 2) {
                    const d = map.distance(points[0], points[1]);
                    alert("Distancia: " + (d/1000).toFixed(3) + " km");

                    if (line) map.removeLayer(line);
                    line = L.polyline(points, {color:"red"}).addTo(map);
                    points = [];
                }
            });
        });

        return btn;
    }
});
L.control.measure = function(opts){ return new L.Control.Measure(opts); }
