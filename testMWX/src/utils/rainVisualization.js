import * as Cesium from 'cesium';

let rainTilt = new Cesium.Cartesian2(0.05, 0.0);
export async function populateRainVisualization(viewer, config) {

    const rainFragmentShader = `
uniform sampler2D colorTexture;
uniform float time;
uniform vec2 windDir; // new: direction of tilt
in vec2 v_textureCoordinates;
uniform float rainSpeed; // now dynamic
float rand(vec2 co) {
   return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}
void main(void) {
   vec4 color = texture(colorTexture, v_textureCoordinates);
   // Speed & density
   float speed = rainSpeed; // now dynamic 
   float density = 300.0;

   // If rain speed <= 0.25, show only background
  if (speed <= 0.50) {
      out_FragColor = color;
      return;
  }
   // UV animation
   vec2 uv = v_textureCoordinates;
   float fall = time * speed;

   // Apply tilt that grows as drop falls
    uv.x += windDir.x * fall * 0.1; // tilt horizontally with wind
    uv.y += fall + windDir.y * fall * 0.05; // mostly downward
 

   // Create vertical streaks
   float column = floor(uv.x * density);
   float offset = rand(vec2(column, 0.0));
   float yPos = fract(uv.y + offset);

   // Streak shape
   float drop = smoothstep(0.02, 0.0, yPos);
   float alpha = drop * 0.5;

   vec3 rainColor = vec3(0.7, 0.7, 0.7);
   vec3 finalColor = mix(color.rgb, rainColor, alpha);
   out_FragColor = vec4(finalColor, 1.0);
}
`;

    const rainStage = new Cesium.PostProcessStage({
        fragmentShader: rainFragmentShader,
        uniforms: {
            time: () => (performance.now() / 1000.0) % 1000,
            windDir: () => rainTilt,
            rainSpeed: () => config.speed
        }
    });
    viewer.scene.postProcessStages.add(rainStage);
}