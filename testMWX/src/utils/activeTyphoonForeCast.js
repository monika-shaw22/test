import * as Cesium from "cesium";
import { hideApiMessage, showApiMessage } from "./errorMessage";
import { renderTyphoonForeCast } from "./typhoonForeCast";
import { AllModels } from "./constatnt";

export async function populateActiveTyphoonForeCast(id, viewer, windLayerRef) {
  const a = {
    year: 2025,
    basinId: "NP",
    govId: 32,
    compositeId: "2025-NP-32",
    results: [
      {
        dateTime: "23",
        initializedDateTime: "2025-11-06T00:00:00+00:00",
        location: { latitude: 8.554886955169348, longitude: 131.98292513318609 },
        maxWindGust: { value: 129.0, unit: "km/h", unitType: 7 },
        sustainedWind: { value: 99.0, unit: "km/h", unitType: 7 },
        status: "Tropical Distrubance",
        window: {
          left: { latitude: 20.7, longitude: 121.9 },
          right: { latitude: 19.3, longitude: 123.1 },
          beginDateTime: "23 Nov 11.30, 35km/h",
          endDateTime: "Tropical Distrubance",
          geometry: { type: "Polygon", coordinates: [] },
        },
      },
      {
        dateTime: "24",
        initializedDateTime: "2025-11-06T00:00:00+00:00",
        location: { latitude: 9.31411862019472, longitude: 125.04892175879053 },
        maxWindGust: { value: 99.0, unit: "km/h", unitType: 7 },
        sustainedWind: { value: 76.2, unit: "km/h", unitType: 7 },
        status: "Tropical Disturbance",
        window: {
          left: { latitude: 24.7, longitude: 125.2 },
          right: { latitude: 23.3, longitude: 126.4 },
          beginDateTime: "24 Nov 17.30, 35km/h",
          endDateTime: "Tropical Disturbance",
          geometry: { type: "Polygon", coordinates: [] },
        },
      },
      {
        dateTime: "25",
        initializedDateTime: "25 Nov 2025",
        location: {
          latitude: 11.030378705200503,
          longitude: 120.43124066780202,
        },
        maxWindGust: { value: 187.2, unit: "km/h", unitType: 7 },
        sustainedWind: { value: 55.0, unit: "km/h", unitType: 7 },
        status: "Koto (Verbena)",
        window: {
          left: { latitude: 13.6, longitude: 131.9 },
          right: { latitude: 12.0, longitude: 132.7 },
          beginDateTime: "25 Nov 23.30, 95km/h",
          endDateTime: "Koto (Verbena)",
          geometry: { type: "Polygon", coordinates: [] },
        },
      },
      {
        dateTime: "26",
        initializedDateTime: "2025-11-06T00:00:00+00:00",
        location: {
          latitude: 12.399547085740725,
          longitude: 118.13176260649284,
        },
        maxWindGust: { value: 240.5, unit: "km/h", unitType: 7 },
        sustainedWind: { value: 185.0, unit: "km/h", unitType: 7 },
        status: "Typhoon",
        window: {
          left: { latitude: 17.0, longitude: 121.4 },
          right: { latitude: 15.3, longitude: 122.6 },
          beginDateTime: "26 Nov 5.30, 100km/h",
          endDateTime: "Typhoon",
          geometry: { type: "Polygon", coordinates: [] },
        },
      },
      {
        dateTime: "27",
        initializedDateTime: "2025-11-06T00:00:00+00:00",
        location: {
          latitude: 14.559900432208625,
          longitude: 110.87457625573211,
        },
        maxWindGust: { value: 170.0, unit: "km/h", unitType: 7 },
        sustainedWind: { value: 130.8, unit: "km/h", unitType: 7 },
        status: "Typhoon",
        window: {
          left: { latitude: 17.6, longitude: 119.9 },
          right: { latitude: 15.9, longitude: 121.1 },
          beginDateTime: "27 Nov 5.30, 120km/h",
          endDateTime: "Typhoon",
          geometry: { type: "Polygon", coordinates: [] },
        },
      },
        { 
        dateTime: "28",
        initializedDateTime: "2025-11-06T00:00:00+00:00",
        location: {
          latitude: 17.56890176575607,
          longitude: 108.5067436752233,
        },
        maxWindGust: { value: 170.0, unit: "km/h", unitType: 7 },
        sustainedWind: { value: 130.8, unit: "km/h", unitType: 7 },
        status: "Tropical Storm",
        window: {
          left: { latitude: 17.6, longitude: 119.9 },
          right: { latitude: 15.9, longitude: 121.1 },
          beginDateTime: "28 Nov 5.30, 85km/h",
          endDateTime: "Tropical Storm",
          geometry: { type: "Polygon", coordinates: [] },
        }, 
      },
    ],
  };
  let windSpeedFactor = 0.2;
  //const windLayerRef = { current: null };
  showApiMessage(`Fetching Active Typhoon Forecast for govId : ${id}...`);
  return fetch(
    `https://api.plc.mwx.ai/api/v1/tropical/forecast?composite=2025-NP-${id}&details=true&windowGeometry=true&radiiGeometry=true`
  )
    .then((r) => r.json())
    .then((src) => {
      hideApiMessage();
      // Store all coordinates here
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(async function (click) {
        const picked = viewer.scene.pick(click.position);
        if (
          Cesium.defined(picked) &&
          picked.id &&
          picked.id.type === "stormPoint"
        ) {
          
          const newDate = picked.id._id;
         
          const typhoonForeCastCast = await fetch(`/fh${newDate}.json`);
          const res = await typhoonForeCastCast.json();

          renderTyphoonForeCast(res, viewer, windSpeedFactor, windLayerRef, {
            west: 108.8983445330864,
            south: 2.892938530926104,
            east: 133.07005546691357,
            north: 26.306061469073892,
          });
          // Approx conversion: 1 km ≈ 0.009 degrees
          const KM_IN_DEG = 0.009;
          const CIRCLES_PER_SITE = 30; // how many circles around each tower
          const COLORS = ["red", "yellow", "green"];
          let heatmapPoints = [];
          AllModels.forEach((model) => {
            const part = model.parts?.[0];
            if (!part) return;
            const { longitude, latitude } = part;
            for (let i = 0; i < CIRCLES_PER_SITE; i++) {
              // Random angle (0 to 360)
              const angle = Math.random() * Math.PI * 2;
              // Random distance from center within 1 km
              const distance = Math.random() * KM_IN_DEG;
              // Convert polar → lat/lon offsets
              const dx = distance * Math.cos(angle);
              const dy = distance * Math.sin(angle);
              const randomColor =
                COLORS[Math.floor(Math.random() * COLORS.length)];
              heatmapPoints.push({
                x: longitude + dx,
                y: latitude + dy,
                value:
                  randomColor === "red"
                    ? 100
                    : randomColor === "yellow"
                    ? 60
                    : 30,
              });
            }

            // Compute dynamic bounds
            const longitudes = heatmapPoints.map((p) => p.x);
            const latitudes = heatmapPoints.map((p) => p.y);
            const bounds = {
              west: Math.min(...longitudes),
              east: Math.max(...longitudes),
              south: Math.min(...latitudes),
              north: Math.max(...latitudes),
            };
            const col = model.color[newDate];
            let heatMap = CesiumHeatmap.create(viewer, bounds, {
              maxOpacity: 0.6,
              minOpacity: 0.1,
              blur: 0.85,
              gradient: {
                0.0: col[2], // green
                0.5: col[1], // yellow
                1.0: col[0], // red
              },
            });
            heatMap.setWGS84Data(30, 100, heatmapPoints);
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      const trackPoints = [];
      a.results.forEach((r) => {
        // Add the marker
        viewer.entities.add({
          id: `${r.dateTime}`,
          type: "stormPoint",
          position: Cesium.Cartesian3.fromDegrees(
            r.location.longitude,
            r.location.latitude
          ),
          point: { pixelSize: 8, color: Cesium.Color.RED },
          label: {
            text: `${r.status}\n${r.sustainedWind.value} ${r.sustainedWind.unit} ${r.window.beginDateTime}`,
            font: "12px sans-serif",
            showBackground: true,
          },
        });
        // Collect point for the line
        trackPoints.push(r.location.longitude, r.location.latitude);
        // Add polygon (if exists)
        if (
          r.window.geometry &&
          r.window.geometry.coordinates &&
          Array.isArray(r.window.geometry.coordinates[0]) &&
          r.window.geometry.coordinates[0].length >= 3
        ) {
          viewer.entities.add({
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(
                r.window.geometry.coordinates[0].flat()
              ),
              material: Cesium.Color.YELLOW.withAlpha(0.3),
              outline: true,
              outlineColor: Cesium.Color.PINK,
            },
          });
        } else {
          console.warn("Polygon coordinates are missing or invalid.");
        }
      });
      // Add continuous line connecting all markers
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(trackPoints),
          width: 3,
          material: Cesium.Color.CYAN,
        },
      });
      return src.results;
    })
    .catch((err) => {
      showApiMessage(
        `Failed to fetch Active Typhoon Forecast for govId : ${id}`,
        3000
      );
      console.error("Failed to load active typhoon forecast data:", err);
    });
}
