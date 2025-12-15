import * as Cesium from 'cesium';
import { AllModels } from './constatnt';

export async function zoomOutUptoPhilliphins(viewer) {
    const philippinesRectangle = Cesium.Rectangle.fromDegrees(
        118,
        11.5000076293945,
        125.99353790283,
        17.551643371582
    );
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 7000000;
    viewer.scene.screenSpaceCameraController.constrainedRectangle = philippinesRectangle;
}

export async function loadAllModels(viewer) {
    const allTileSets = [];
    for (const model of AllModels) {
        const tilesets = await loadMultiPartModel(model.parts, viewer);
        if (tilesets.length > 1) {
            allTileSets.push(tilesets[1])
        }
    }
    //viewer.flyTo(allTileSets[0]);
    return allTileSets
}

export function animateAllModels(tilesets, viewer, windSpeedFactor) {
    for (const tileset of tilesets) {
        animateTileset(tileset, viewer, windSpeedFactor);
    }
}

function animateTileset(tileset, viewer, windSpeedFactor) {
    const staticTransform = Cesium.Matrix4.clone(tileset.modelMatrix);

    viewer.scene.postUpdate.addEventListener(function (scene, time) {
        const swayAngle = Cesium.Math.toRadians(windSpeedFactor) * Math.sin(Cesium.JulianDate.secondsDifference(time, Cesium.JulianDate.now()) * 2);
        const swayMatrix3 = Cesium.Matrix3.fromRotationX(swayAngle);
        const swayMatrix4 = Cesium.Matrix4.fromRotationTranslation(swayMatrix3);

        const animatedTransform = Cesium.Matrix4.multiply(staticTransform, swayMatrix4, new Cesium.Matrix4());
        tileset.modelMatrix = animatedTransform;
    });
}


async function loadMultiPartModel(parts, viewer) {
    const loadedTilesets = [];
    for (const part of parts) {
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(part.assetId);

        const position = Cesium.Cartesian3.fromDegrees(part.longitude, part.latitude, part.height);
        const baseMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);

        const rotationAngle = Cesium.Math.toRadians(part.rotationDeg || 0);
        const rotationMatrix3 = Cesium.Matrix3.fromRotationZ(rotationAngle);
        const rotationMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix3);

        const scaleMatrix = Cesium.Matrix4.fromUniformScale(part.scale || 1.0);

        let transformMatrix = Cesium.Matrix4.multiply(baseMatrix, rotationMatrix4, new Cesium.Matrix4());
        transformMatrix = Cesium.Matrix4.multiply(transformMatrix, scaleMatrix, new Cesium.Matrix4());

        tileset.modelMatrix = transformMatrix;
        viewer.scene.primitives.add(tileset);
        loadedTilesets.push(tileset);
    }
    return loadedTilesets;
}

export async function flyToSelectedModel(model, viewer) {
    const parts = model.parts;
    if (parts.length > 0) {
        const firstPart = parts[0];
        const position = Cesium.Cartesian3.fromDegrees(firstPart.longitude, firstPart.latitude, firstPart.height + 35);
 
        const offset = new Cesium.Cartesian3(15.0, 20.0, 2.0);
        const zoomedPosition = Cesium.Cartesian3.add(position, offset, new Cesium.Cartesian3());
 
        viewer.camera.flyTo({
            destination: zoomedPosition,
            orientation: {
                heading: Cesium.Math.toRadians(90),
                pitch: Cesium.Math.toRadians(-30),
                roll: 0
            },
 
            duration: 2
        });
    }
}


export function addModelMarkers(viewer, models) {
    models.forEach(model => {
        if (model.parts && model.parts.length > 0) {
            const firstPart = model.parts[0];
            const marker = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(firstPart.longitude, firstPart.latitude, 30),
                point: {
                    pixelSize: 20,
                    color: Cesium.Color.RED
                },
                label: {
                    text: model.name,
                    font: '20px sans-serif',
                    showBackground: true,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -12)
                }
            });
            marker.modelData = model;
        }
    });

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (click) {
        const picked = viewer.scene.pick(click.position);
         if (Cesium.defined(picked) && picked.id) {
            viewer.flyTo(picked.id, {
                offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-100), 100)
            });
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}