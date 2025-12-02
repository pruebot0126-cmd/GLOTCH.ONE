L.Path.include({
    _onDragStart() {
        this._dragging = true;
        this._map.dragging.disable();
    },
    _onDragEnd() {
        this._dragging = false;
        this._map.dragging.enable();
    }
});

L.Path.addInitHook(function () {
    if (this.options.draggable) {
        this.dragging = new L.Handler.PathDrag(this);
        this.dragging.enable();
    }
});

L.Handler.PathDrag = L.Handler.extend({
    initialize: function (path) {
        this._path = path;
    },

    addHooks: function () {
        this._path.on('mousedown', this._onDragStart, this);
    },

    removeHooks: function () {
        this._path.off('mousedown', this._onDragStart, this);
    },

    _onDragStart: function (e) {
        const path = this._path;
        path._onDragStart();

        const startPoint = e.layerPoint;

        const onMove = (ev) => {
            const offset = ev.layerPoint.subtract(startPoint);
            path._transform(offset);
        };

        const onUp = () => {
            path._onDragEnd();
            path._map.off('mousemove', onMove);
            path._map.off('mouseup', onUp);
        };

        path._map.on('mousemove', onMove);
        path._map.on('mouseup', onUp);
    }
});
