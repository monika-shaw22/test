import { WindLayer } from 'cesium-wind-layer';
import { hideApiMessage, showApiMessage } from './errorMessage';

export async function renderTyphoonForeCast(foreCastingHour, viewer, windSpeedFactor, windLayerRef, activeTyphoonBounds) {
    const { lat, lon, u10, v10 } = foreCastingHour.grid;
    const [west, south, east, north] = foreCastingHour.meta.bbox;
    const width = lon.length;
    const height = lat.length;

    const uArr = new Float32Array(width * height);
    const vArr = new Float32Array(width * height);
    let k = 0;
    for (let i = 0; i < height; i++) {
        const uRow = u10[i];
        const vRow = v10[i];
        for (let j = 0; j < width; j++, k++) {
            uArr[k] = uRow[j];
            vArr[k] = vRow[j];
        }
    }


    const windData = {
        u: { array: uArr },
        v: { array: vArr },
        width,
        height,
        bounds: activeTyphoonBounds === null ? { west, south, east, north } : activeTyphoonBounds
    };

    if (windLayerRef.current) {
        windLayerRef.current.destroy();
        windLayerRef.current = null;
    }

    const windOptions = {
        domain: { min: 0, max: 8 },
        speedFactor: 2,
        lineWidth: { min: 1, max: 2 },
        lineLength: { min: 50, max: 100 },
        particleHeight: 10,
        particlesTextureSize: activeTyphoonBounds === null ? 250 : 300,
        flipY: true,
        useViewerBounds: true,
        dynamic: true,
        colors: ['#00f', '#0ff', '#0f0', '#ff0', '#f00']
    };
    windLayerRef.current = new WindLayer(viewer, windData, windOptions);
    typhoonVisualization(viewer)

}

export async function getTyphoonForeCast(foreCastHour) {
    try {
        showApiMessage(`Fetching Typhoon Forecast...`)
        const typhoonForeCastCast = await fetch(foreCastHour);

        if (!typhoonForeCastCast.ok) {
            throw new Error(`HTTP error! Status: ${typhoonForeCastCast.status}`);
        }

        const res = await typhoonForeCastCast.json();
        hideApiMessage()
        return res;
    } catch (error) {
        console.error("Failed to fetch typhoon forecast:", error);
        showApiMessage("Failed to fetch Typhoon Forecast", 3000)
        return null;
    }
}

export function typhoonVisualization(viewer) {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(121.0220, 14.6075, 2000000)
    });
}

export function computeBBox(centerLat, centerLon, coverLat, coverLon) {

    const latDiff = Math.abs(coverLat - centerLat);
    const lonDiff = Math.abs(coverLon - centerLon);

    const halfExtentLat = latDiff;
    const halfExtentLon = lonDiff;

    const minLat = centerLat - halfExtentLat;
    const maxLat = centerLat + halfExtentLat;
    const minLon = centerLon - halfExtentLon;
    const maxLon = centerLon + halfExtentLon;
    return {
        west: minLon,
        south: minLat,
        east: maxLon,
        north: maxLat
    };
}


const R = 6371;
function toRadians(deg) {
    return deg * Math.PI / 180;
}
function toDegrees(rad) {
    return rad * 180 / Math.PI;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

function destinationPoint(lat, lon, distanceKm, bearingDeg) {
    const δ = distanceKm / R;
    const θ = toRadians(bearingDeg);
    const φ1 = toRadians(lat);
    const λ1 = toRadians(lon);
    const φ2 = Math.asin(
        Math.sin(φ1) * Math.cos(δ) +
        Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
    );
    const λ2 = λ1 + Math.atan2(
        Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
        Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );
    return [toDegrees(φ2), ((toDegrees(λ2) + 540) % 360) - 180];
}
export function computeSquareBBoxInKm(centerLat, centerLon, coverLat, coverLon) {

    const distanceKm = haversineDistance(centerLat, centerLon, coverLat, coverLon);

    const north = destinationPoint(centerLat, centerLon, distanceKm, 0);
    const east = destinationPoint(centerLat, centerLon, distanceKm, 90);
    const south = destinationPoint(centerLat, centerLon, distanceKm, 180);
    const west = destinationPoint(centerLat, centerLon, distanceKm, 270);
    return {
        west: west[1],
        south: south[0],
        east: east[1],
        north: north[0]
    };
}

export function getLowestLongitudeLocation(locations) {
    if (!locations.length) return null;
    return locations.reduce((lowest, current) => {
        return current.location.longitude < lowest.location.longitude
            ? current
            : lowest;
    });
}