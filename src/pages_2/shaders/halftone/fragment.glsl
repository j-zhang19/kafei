uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uShadowRepetitions;
uniform float uLightRepetitions;
uniform vec3 uDirection;
uniform float uShadowLow;
uniform float uShadowHigh;
uniform float uLightLow;
uniform float uLightHigh;


varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl

vec3 halftone(vec3 color, float repetitions, vec3 direction, float low, float high, vec3 pointColor, vec3 normal) {
    float intensity = dot(normal, direction);
    intensity = smoothstep(low, high, intensity);

    vec2 uv = gl_FragCoord.xy / uResolution.y;
    uv = mod(uv * repetitions, 1.0);

    float point = distance(uv, vec2(.5));
    point = 1. - step(.5 * intensity, point);


    // pointColor.z = 1.;
    vec3 finalColor = mix(color, pointColor, point);

    return finalColor;
}

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;

    vec3 light = vec3(0.);
    light += ambientLight(
        vec3(1.),   // Light color
        1.                // Light intensity
    );

    light += directionalLight(
        vec3(1.),   // Light color
        1.,               // Light intensity
        normal,            // Normal
        vec3(1.),   // Light position
        viewDirection,    // View direction
        1.                // Specular power
    );

    color *= light;


    // Halftone
    // // Shadow
    color = halftone(
        color,
        uShadowRepetitions,
        -uDirection,
        uShadowLow,
        uShadowHigh,
        vec3(1., 0., 0.),
        normal
    );
    // // Light
    color = halftone(
        color,
        uLightRepetitions,
        uDirection,
        uLightLow,
        uLightHigh,
        vec3(1.0),
        normal
    );

    
    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}