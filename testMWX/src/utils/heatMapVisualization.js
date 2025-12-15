let heatmapLayer;
export async function visualizeHeatMap(foreCastingHour, viewer, activeTyphoonBounds) {
    let [west, south, east, north] = foreCastingHour.meta.bbox
    let data = [];
    const grid = foreCastingHour.grid;
    if (activeTyphoonBounds === null) {
        [west, south, east, north] = foreCastingHour.meta.bbox;
        for (let i = 0; i < grid.lat.length; i++) {
            for (let j = 0; j < grid.lon.length; j++) {
                const u = grid.u10[i][j];
                const v = grid.v10[i][j];
                const speed = Math.sqrt(u * u + v * v); 
                data.push({ x: grid.lon[j], y: grid.lat[i], value: speed });
            }
        }
    } else {
        [west, south, east, north] = activeTyphoonBounds
        
        const remappedLats = grid.lat.map((_, i) =>
            south + (i / (grid.lat.length - 1)) * (north - south)
        );
        const remappedLons = grid.lon.map((_, j) =>
            west + (j / (grid.lon.length - 1)) * (east - west)
        );
       
        data = [];
        for (let i = 0; i < remappedLats.length; i++) {
            for (let j = 0; j < remappedLons.length; j++) {
                const u = grid.u10[i][j];
                const v = grid.v10[i][j];
                const speed = Math.sqrt(u * u + v * v);
                data.push({ x: remappedLons[j], y: remappedLats[i], value: speed });
            }
        }
    }

    const bounds = { west, south, east, north };

    let heatMap = CesiumHeatmap.create(viewer, bounds, {
        maxOpacity: 0.6,
        minOpacity: 0.1,
        blur: 0.85,
        gradient: {
            0.0: '#00f',  // blue
            0.25: '#0ff', // cyan
            0.5: '#0f0',  // green
            0.75: '#ff0', // yellow
            1.0: '#f00'   // red
        }
    });
   
    heatMap.setWGS84Data(0, 8, data);
    heatMap._layer.show = false;
    heatmapLayer = heatMap._layer;
}


export function toggleHeatmap() {
    heatmapLayer.show = !heatmapLayer.show;
}