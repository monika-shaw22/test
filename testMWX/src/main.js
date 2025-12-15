import "./index.css";
import * as Cesium from "cesium";
import {
  loadAllModels,
  flyToSelectedModel,
  zoomOutUptoPhilliphins,
  animateAllModels,
  addModelMarkers,
} from "./utils/loadAllModels";
import {
  AllModels,
  ManilaLoc,
  TyphoonForeCast,
  viewerOptions,
} from "./utils/constatnt";
import { getWeatherAndAQIDetails } from "./utils/weatherDetails";
import {
  computeSquareBBoxInKm,
  getLowestLongitudeLocation,
  getTyphoonForeCast,
  renderTyphoonForeCast,
  typhoonVisualization,
} from "./utils/typhoonForeCast";
import { toggleHeatmap, visualizeHeatMap } from "./utils/heatMapVisualization";
import {
  getActiveTyphoonData,
  populateTyphoonDropdown,
} from "./utils/activeTyphoons";
import { populateActiveTyphoonForeCast } from "./utils/activeTyphoonForeCast";
import { populateRainVisualization } from "./utils/rainVisualization";
import {
  destroy3DTyphoon,
  load3DTyphoon,
  remove3DTyphoonBox,
} from "./utils/3DTyphoon";

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
let windSpeedFactor = 0.2;
let rainConfig = { speed: 0.2 };
const windLayerRef = { current: null };
let activeTyphoonForeCastResults = [];

const viewer = new Cesium.Viewer("cesiumContainer", viewerOptions);

const allTileSets = await loadAllModels(viewer);
animateAllModels(allTileSets, viewer, windSpeedFactor);
zoomOutUptoPhilliphins(viewer);
addModelMarkers(viewer, AllModels);

const dropdown = document.getElementById("modelDropdown");
AllModels.forEach((model) => {
  const option = document.createElement("option");
  option.value = model.id;
  option.text = model.name;
  dropdown.appendChild(option);
});

dropdown.value = AllModels[0].id;
flyToSelectedModel(AllModels[0], viewer);

dropdown.addEventListener("change", () => {
  const selectedId = dropdown.value;
  const selectedModel = AllModels.find((m) => m.id === selectedId);
  if (selectedModel) {
    flyToSelectedModel(selectedModel, viewer);
  }
});

const typhoonForeCastDropdown = document.getElementById(
  "typhoonForeCastDropdown"
);
TyphoonForeCast.forEach((model) => {
  const option = document.createElement("option");
  option.value = model.id;
  option.text = model.name;
  typhoonForeCastDropdown.appendChild(option);
});

typhoonForeCastDropdown.value = TyphoonForeCast[0].id;

typhoonForeCastDropdown.addEventListener("change", async () => {
  if (windLayerRef.current) {
    windLayerRef.current.destroy();
    windLayerRef.current = null;
  }
  viewer.entities.removeAll();
  const selectedId = typhoonForeCastDropdown.value;
  const selectedForeCast = TyphoonForeCast.find((m) => m.id === selectedId);
  const hatMapLabel = document.getElementById("heatMapLabel");

  const heatmapSwitch = document.getElementById("toggleHeatmapSwitch");
  if (heatmapSwitch.checked) {
    heatmapSwitch.checked = false;
    toggleHeatmap();
  }

  if (selectedForeCast.id !== "") {
    const activeTyphoonDropdown = document.getElementById("activetyphoon");

    const foreCast = await getTyphoonForeCast(
      selectedForeCast.foreCastingHour0API
    );
    if (activeTyphoonDropdown.value !== "default") {
      const lowestLongitude = getLowestLongitudeLocation(
        activeTyphoonForeCastResults
      );

      const coverLat = lowestLongitude.location.latitude,
        coverLon = lowestLongitude.location.longitude;
      const activeTyphoonBounds = computeSquareBBoxInKm(
        ManilaLoc.centerLat,
        ManilaLoc.centerLon,
        coverLat,
        coverLon
      );

      renderTyphoonForeCast(
        foreCast,
        viewer,
        windSpeedFactor,
        windLayerRef,
        activeTyphoonBounds
      );
      const boundsArray = [
        activeTyphoonBounds.west,
        activeTyphoonBounds.south,
        activeTyphoonBounds.east,
        activeTyphoonBounds.north,
      ];
      visualizeHeatMap(foreCast, viewer, boundsArray);
    } else {
      renderTyphoonForeCast(
        foreCast,
        viewer,
        windSpeedFactor,
        windLayerRef,
        null
      );
      visualizeHeatMap(foreCast, viewer, null);
    }
    hatMapLabel.style.display = "block";
  } else {
    hatMapLabel.style.display = "none";
    windLayerRef.current.destroy();
    windLayerRef.current = null;
  }
});

document
  .getElementById("toggleHeatmapSwitch")
  .addEventListener("change", toggleHeatmap);

const openWeatherDetailsBtn = document.getElementById(
  "openWeatherDetailsButton"
);

const closeWeatherBtn = document.getElementById("closeWeatherBtn");
const closeAlertBtn = document.getElementById("closeAlertsBtn");
const closeAQIBtn = document.getElementById("closeAqiBtn");

const weatherPopup = document.getElementById("weatherPopup");
const alertPopup = document.getElementById("alertsPopup");
const aqiPopup = document.getElementById("aqiPopup");

closeWeatherBtn.addEventListener("click", () => {
  weatherPopup.style.display = "none";
  openWeatherDetailsBtn.disabled = false;
  openWeatherDetailsBtn.style.color = "white";
  openWeatherDetailsBtn.style.background = "#01c9d0";
});

closeAlertBtn.addEventListener("click", () => {
  alertPopup.style.display = "none";
  openWeatherDetailsBtn.disabled = false;
  openWeatherDetailsBtn.style.color = "white";
  openWeatherDetailsBtn.style.background = "#01c9d0";
});

closeAQIBtn.addEventListener("click", () => {
  aqiPopup.style.display = "none";
  openWeatherDetailsBtn.disabled = false;
  openWeatherDetailsBtn.style.color = "white";
  openWeatherDetailsBtn.style.background = "#01c9d0";
});

openWeatherDetailsBtn.addEventListener("click", () => {
  weatherPopup.style.display = "block";
  alertPopup.style.display = "block";
  aqiPopup.style.display = "block";

  openWeatherDetailsBtn.disabled = true;
  openWeatherDetailsBtn.style.color = "#827a7a";
  openWeatherDetailsBtn.style.background = "#cecaca";
});

getWeatherAndAQIDetails();
setInterval(getWeatherAndAQIDetails, 10 * 60 * 1000);

document.getElementById("windSlider").addEventListener("input", (e) => {
  const value = parseInt(e.target.value, 10);
  document.getElementById("windValue").textContent = value;
  windSpeedFactor = value / 100 / 2;
  rainConfig.speed = value / 100;
  const currentHeight = viewer.camera.positionCartographic.height;
  if (currentHeight > 2000) {
    rainConfig.speed = 0;
  } else {
    rainConfig.speed = windSpeedFactor;
    populateRainVisualization(viewer, rainConfig);
  }
  animateAllModels(allTileSets, viewer, windSpeedFactor);
  if (windLayerRef.current) {
    windLayerRef.current.updateOptions({
      speedFactor: windSpeedFactor,
    });
  }
});

document.getElementById("flyToPhiphinns").addEventListener("click", () => {
  typhoonVisualization(viewer);
});

function toggle3DTyphoon() {
  const TyphoonSwitch = document.getElementById("toggle3DTyphoonSwitch");
  if (TyphoonSwitch.checked) {
    load3DTyphoon(viewer);
    const hatMapLabel = document.getElementById("heatMapLabel");
    hatMapLabel.style.display = "none";
    windLayerRef.current.destroy();
    windLayerRef.current = null;
    viewer.entities.removeAll();
    const heatmapSwitch = document.getElementById("toggleHeatmapSwitch");
    if (heatmapSwitch.checked) {
      heatmapSwitch.checked = false;
      toggleHeatmap();
    }
  } else {
    destroy3DTyphoon();
    remove3DTyphoonBox(viewer);
  }
}

document
  .getElementById("toggle3DTyphoonSwitch")
  .addEventListener("change", toggle3DTyphoon);

const activeTyphoons = await getActiveTyphoonData();

populateTyphoonDropdown({
  count: 1,
  storms: [
    // {
    //   "year": "2025",
    //   "basinId": "NP",
    //   "govId": 19,
    //   "name": "KAJIKI",
    //   "isActive": true,
    //   "isSubtropical": false,
    //   "compositeId": "2025-NP-19"
    // }
    {
      year: "2025",
      basinId: "NP",
      govId: 32,
      name: "Verbena",
      isActive: true,
      isSubtropical: false,
      compositeId: "2025-NP-32",
    },
  ],
});

const activeTyphoonDropdown = document.getElementById("activetyphoon");
activeTyphoonDropdown.addEventListener("change", async () => {
  const selectedId = activeTyphoonDropdown.value;
  if (selectedId !== "default") {
    populateActiveTyphoonForeCast(selectedId, viewer, windLayerRef).then(
      (data) => {
        activeTyphoonForeCastResults = data;
      }
    );
  } else {
    if (windLayerRef.current) {
      windLayerRef.current.destroy();
      windLayerRef.current = null;
    }
    viewer.entities.removeAll();
  }
});

let lastHeight = viewer.camera.positionCartographic.height;
viewer.camera.changed.addEventListener(() => {
  const currentHeight = viewer.camera.positionCartographic.height;
  if (500 < lastHeight) {
    rainConfig.speed = 0;
  } else {
    rainConfig.speed = windSpeedFactor;
  }
  lastHeight = currentHeight;
});
