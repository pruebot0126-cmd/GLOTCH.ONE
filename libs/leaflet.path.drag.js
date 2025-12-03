// Leaflet.Path.Drag — Permite arrastrar polígonos
L.Path.include({
    _initEvents: function () {
        if (L.Path.Drag) {
            this.dragging = new L.Path.Drag(this);
            this.dragging.enable();
        }
    }
});

L.Path.Drag = L.Handler.extend({
    initialize: function (path) {
        this._path = path;
    },
    addHooks: function () {
        this._path.on('mousedown', this._onDown, this);
    },
    removeHooks: function () {
        this._path.off('mousedown', this._onDown, this);
    },
    _onDown: function (e) {
        this._startPoint = e.containerPoint.clone();
        this._path._map.on('mousemove', this._onMove, this);
        this._path._map.on('mouseup', this._onUp, this);
    },
    _onMove: function (e) {
        const dx = e.containerPoint.x - this._startPoint.x;
        const dy = e.containerPoint.y - this._startPoint.y;
        this._startPoint = e.containerPoint.clone();

        this._path.eachLatLng(function (latlng) {
            const point = this._path._map.latLngToLayerPoint(latlng);
            const newPoint = L.point(point.x + dx, point.y + dy);
            const newLatLng = this._path._map.layerPointToLatLng(newPoint);
            latlng.lat = newLatLng.lat;
            latlng.lng = newLatLng.lng;
        });
        this._path.redraw();
    },
    _onUp: function () {
        this._path._map.off('mousemove', this._onMove, this);
        this._path._map.off('mouseup', this._onUp, this);
    }
});
