uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

// Fog uniforms
uniform vec3 uFogColor;
varying vec3 vFogColor;
varying float vFogFactor;

varying float vElevation;

void main() {
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;

    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    gl_FragColor = vec4(mix(color, vFogColor, vFogFactor), 1.0);
    #include <colorspace_fragment>
}