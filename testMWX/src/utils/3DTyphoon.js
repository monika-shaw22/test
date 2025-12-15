import { WindLayer } from 'cesium-wind-layer';
import * as Cesium from 'cesium';

let windLayers = [];
let typhoonBoxEntity = null;

export function load3DWindLayers(viewer) {
    const fileName = `/hurricane_wind_fixed.json`;
    fetch(fileName)
        .then(response => response.json())
        .then(data => {
            windLayers.forEach(layer => layer.destroy());
            windLayers = [];
            data.levels.forEach(level => {
                const windData = {
                    ...level,
                    bounds: {
                        west: data.bbox[0],
                        south: data.bbox[1],
                        east: data.bbox[2],
                        north: data.bbox[3]
                    },
                    width: data.width,
                    height: data.height,
                    unit: data.unit,
                    time: data.time
                };
                const windOptions = {
                    domain: { min: 0, max: 8 },
                    speedFactor: 0.1,
                    lineWidth: { min: 1, max: 2 },
                    lineLength: { min: 50, max: 100 },
                    particleHeight: level.height * 1000,
                    particlesTextureSize: 35,
                    flipY: true,
                    useViewerBounds: true,
                    dynamic: true,
                    colors: ['#00f', '#0ff', '#0f0', '#ff0', '#f00']
                };
                const layer = new WindLayer(viewer, windData, windOptions);
                layer.addEventListener('dataChange', () => {
                    console.log(`Data changed for ${level.name}`);
                });
                layer.addEventListener('optionsChange', () => {
                    console.log(`Options changed for ${level.name}`);
                });
                windLayers.push(layer);
            });
            // Optional: fly to the bounds of the data
            const rectangle = Cesium.Rectangle.fromDegrees(
                data.bbox[0],
                data.bbox[1],
                data.bbox[2],
                data.bbox[3]
            );
            viewer.camera.flyTo({ destination: rectangle });
        })
        .catch(error => {
            console.error('Failed to load multi-level wind data:', error);
        });
}
export function load3DTyphoon(viewer) {
    let volumeCenter = Cesium.Cartesian3.fromDegrees(121.0020, 14.6075, 100000.0);
    const volumeDimensions = new Cesium.Cartesian3(580000.0, 450000.0, 400000.0);

    const boxGeometry = Cesium.BoxGeometry.createGeometry(new Cesium.BoxGeometry({
        vertexFormat: Cesium.VertexFormat.POSITION_AND_ST,
        maximum: volumeDimensions,
        minimum: new Cesium.Cartesian3(-volumeDimensions.x, -volumeDimensions.y, -volumeDimensions.z)
    }));
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(volumeCenter);
   
    const geometryInstance = new Cesium.GeometryInstance({
        geometry: boxGeometry,
        modelMatrix: modelMatrix,
        id: "volumeBox"
    });

    const base643DTextureAtlas = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-q1mMLjgijhxITUKVdkkr5OEjs5U5JcOY9Q&s"

    const volumeMaterial = new Cesium.Material({
        fabric: {
            type: 'VolumeRayMarch3D',
            uniforms: {
                baseTexture: base643DTextureAtlas,
                numSlices: 32.0,
                time: 0.0,
                volumeDimensions: new Cesium.Cartesian3(volumeDimensions.x, volumeDimensions.y, volumeDimensions.z)
            },
            source: `
     uniform sampler2D baseTexture;
     uniform float numSlices;
     uniform float time;
     uniform vec3 volumeDimensions;
     czm_material czm_getMaterial(czm_materialInput materialInput) {
       czm_material material = czm_getDefaultMaterial(materialInput);
       vec3 rayDir = normalize(materialInput.positionToEyeEC);
       vec3 startPos = materialInput.str;
       float steps = 64.0;
       float stepSize = 1.0 / steps;
       float accumulatedAlpha = 0.0;
       vec3 accumulatedColor = vec3(0.0);
       for (float i = 0.0; i < 1.0; i += stepSize) {
         vec3 samplePos = startPos + rayDir * i * 2.0 * volumeDimensions;
         vec3 normalizedPos = samplePos / (2.0 * volumeDimensions) + 0.5;
         float sliceFloat = normalizedPos.z * (numSlices - 1.0);
         float sliceIndex = floor(sliceFloat);
         float sliceFrac = fract(sliceFloat);
         float slicesPerRow = sqrt(numSlices);
         float sliceX = mod(sliceIndex, slicesPerRow);
         float sliceY = floor(sliceIndex / slicesPerRow);
         vec2 uv1 = vec2(
           (sliceX + normalizedPos.x) / slicesPerRow,
           (sliceY + normalizedPos.y) / slicesPerRow
         );
         float nextSliceX = mod(sliceIndex + 1.0, slicesPerRow);
         float nextSliceY = floor((sliceIndex + 1.0) / slicesPerRow);
         vec2 uv2 = vec2(
           (nextSliceX + normalizedPos.x) / slicesPerRow,
           (nextSliceY + normalizedPos.y) / slicesPerRow
         );
         float density1 = texture(baseTexture, uv1).r;
         float density2 = texture(baseTexture, uv2).r;
         float density = mix(density1, density2, sliceFrac);
         float alpha = density * 0.001;
         vec3 color = vec3(1.0);
         accumulatedColor = accumulatedColor + (1.0 - accumulatedAlpha) * alpha * color;
         accumulatedAlpha += (1.0 - accumulatedAlpha) * alpha;
         if (accumulatedAlpha > 0.95) {
           break;
         }
       }
       material.diffuse = accumulatedColor;
       material.alpha = accumulatedAlpha;
       return material;
     }
   `
        }
    });

    const volumePrimitive = new Cesium.Primitive({
        geometryInstances: geometryInstance,
        appearance: new Cesium.MaterialAppearance({
            material: volumeMaterial,
            translucent: true,
            faceForward: true,
            closed: true
        }),
        asynchronous: false
    });
    viewer.scene.primitives.add(volumePrimitive);

    typhoonBoxEntity = viewer.entities.add({
        name: "Typhoon Box Outline",
        position: volumeCenter,
        box: {
            dimensions: new Cesium.Cartesian3(
                volumeDimensions.x * 2,
                volumeDimensions.y * 2,
                volumeDimensions.z * 2
            ),
            fill: false, 
            outline: true,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1.0  
        }
    });
    const startPosition = Cesium.Cartesian3.fromDegrees(121.0020, 14.6075, 100000.0);
    const endPosition = Cesium.Cartesian3.fromDegrees(121.5, 14.0, 100000.0);
    const animationDuration = 60.0;

    const startTime = viewer.clock.currentTime.secondsOfDay;
    viewer.clock.onTick.addEventListener(() => {
        const elapsed = viewer.clock.currentTime.secondsOfDay - startTime;
        const t = (elapsed % animationDuration) / animationDuration;
      
        const currentPosition = Cesium.Cartesian3.lerp(startPosition, endPosition, t, new Cesium.Cartesian3());
       
        const newModelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(currentPosition);
        geometryInstance.modelMatrix = newModelMatrix;
       
        volumePrimitive.geometryInstances = [new Cesium.GeometryInstance({
            geometry: boxGeometry,
            modelMatrix: newModelMatrix,
            id: "volumeBox"
        })];
      
        volumeMaterial.uniforms.time = t;
    });
   
    load3DWindLayers(viewer)
}

export function destroy3DTyphoon() {
    windLayers.forEach(layer => layer.destroy());
    windLayers = [];
}

export function remove3DTyphoonBox(viewer) {
    if (typhoonBoxEntity) {
        viewer.entities.remove(typhoonBoxEntity);
        typhoonBoxEntity = null; 
    }
}