export const AllModels = [
  {
    name: "SMART 278 BALONG BATO",
    id: "1",
    color: {
      23: ["#0f0", "#0f0", "#0f0"],
      24: ["#ff0", "#f00", "#0f0"],
      25: ["#0f0", "#ff0", "#f00"],
      26: ["#0f0", "#0f0", "#0f0"],
      27: ["#0f0", "#0f0", "#0f0"],
      28: ["#0f0", "#0f0", "#0f0"],
    },
    parts: [
      {
        assetId: 3659537,
        longitude: 121.002,
        latitude: 14.6075,
        height: 0,
        rotationDeg: 0,
        scale: 1.0,
      },
      {
        assetId: 3659538,
        longitude: 121.002,
        latitude: 14.6075,
        height: 0,
        rotationDeg: 0,
        scale: 1.0,
      },
    ],
  },
  {
    name: "PLDT GREENHILLS",
    id: "2",
    color: {
      23: ["#0f0", "#0f0", "#0f0"],
      24: ["#ff0", "#f00", "#0f0"],
      25: ["#0f0", "#ff0", "#f00"],
      26: ["#0f0", "#0f0", "#0f0"],
      27: ["#0f0", "#0f0", "#0f0"],
      28: ["#0f0", "#0f0", "#0f0"],
    },
    parts: [
      {
        assetId: 3655603,
        longitude: 121.0394,
        latitude: 14.6071,
        height: 0,
        rotationDeg: 140,
        scale: 0.5,
      },
    ],
  },
  {
    name: "SMART G71 WACK WACK",
    id: "3",
    color: {
      23: ["#0f0", "#0f0", "#0f0"],
      24: ["#ff0", "#f00", "#0f0"],
      25: ["#0f0", "#ff0", "#f00"],
      26: ["#0f0", "#0f0", "#0f0"],
      27: ["#0f0", "#0f0", "#0f0"],
      28: ["#0f0", "#0f0", "#0f0"],
    },
    parts: [
      {
        assetId: 3659537,
        longitude: 121.0487,
        latitude: 14.5995,
        height: 0,
        rotationDeg: 0,
        scale: 1.0,
      },
      {
        assetId: 3659538,
        longitude: 121.0487,
        latitude: 14.5995,
        height: 0,
        rotationDeg: 0,
        scale: 1.0,
      },
    ],
  },
  {
    name: "SMART G0603 SUN SAN JUAN - CAVALR",
    id: "4",
    color: {
      23: ["#0f0", "#0f0", "#0f0"],
      24: ["#ff0", "#f00", "#0f0"],
      25: ["#0f0", "#ff0", "#f00"],
      26: ["#0f0", "#0f0", "#0f0"],
      27: ["#0f0", "#0f0", "#0f0"],
      28: ["#0f0", "#0f0", "#0f0"],
    },
    parts: [
      {
        assetId: 3659537,
        longitude: 121.0221,
        latitude: 14.61,
        height: 0,
        rotationDeg: 0,
        scale: 1.0,
      },
      {
        assetId: 3659538,
        longitude: 121.0221,
        latitude: 14.61,
        height: 0,
        rotationDeg: 0,
        scale: 1.0,
      },
    ],
  },
  {
    name: "SMART G6396 BELL - SAN JUAN CITY - J W",
    id: "5",
    color: {
      23: ["#0f0", "#0f0", "#0f0"],
      24: ["#ff0", "#f00", "#0f0"],
      25: ["#0f0", "#ff0", "#f00"],
      26: ["#0f0", "#0f0", "#0f0"],
      27: ["#0f0", "#0f0", "#0f0"],
      27: ["#0f0", "#0f0", "#0f0"],
    },
    parts: [
      {
        assetId: 3659537,
        longitude: 121.0254,
        latitude: 14.5996,
        height: 0,
        rotationDeg: 0,
        scale: 1.0,
      },
      {
        assetId: 3659538,
        longitude: 121.0254,
        latitude: 14.5996,
        height: 0,
        rotationDeg: 0,
        scale: 1.0,
      },
    ],
  },
];

export const TyphoonForeCast = [
  {
    name: "Select Typhoon ForeCast",
    id: "",
    foreCastingHour0API: "",
  },
  {
    name: "Forecast_Hour_0",
    id: "fh0",
    foreCastingHour0API: "https://api.plc.mwx.ai/api/v1/wind/uv?fh=0",
  },
  {
    name: "Forecast_Hour_5",
    id: "fh5",
    foreCastingHour0API: "https://api.plc.mwx.ai/api/v1/wind/uv?fh=5",
  },
  {
    name: "Forecast_Hour_24",
    id: "fh24",
    foreCastingHour0API: "https://api.plc.mwx.ai/api/v1/wind/uv?fh=24",
  },
];
export const viewerOptions = {
  baseLayerPicker: true,
  fullscreenButton: false,
  geocoder: true,
  homeButton: false,
  infoBox: false,
  sceneModePicker: false,
  selectionIndicator: false,
  navigationInstructionsInitiallyVisible: false,
  navigationHelpButton: false,
  timeline: false,
  animation: false,
};

export const APIs = {
  Weather: "https://api.plc.mwx.ai/api/v1/weather?lat=14.5995&lon=120.9842",
  activeTyphoon: "https://api.plc.mwx.ai/api/v1/tropical/active",
};

export const ManilaLoc = {
  centerLat: 14.5995,
  centerLon: 120.9842,
};
