uniform float uTime;
uniform vec3 uColor;

varying vec3 vPosition;
varying vec3 vNormal;

#include ../includes/random2D.glsl

void main() {
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing) {
        normal *= -1.;
    }
    float stripes = mod(vPosition.y * 20. - uTime * .7, 1.0);
    stripes = pow(stripes, 4.);

    // Fresnel
    vec3 viewDirection = vPosition - cameraPosition;
    viewDirection = normalize(viewDirection);
    float fresnel = dot(viewDirection, normal) + 1.;
    fresnel = pow(fresnel, 2.0);

    // Falloff
    float falloff = smoothstep(.95, 0., fresnel);

    // Holographic
    float holographic = stripes * fresnel;
    holographic += fresnel * 1.25;
    holographic *= falloff;


    float randomGlitch = random2D(vec2(uTime, uTime));
    holographic *= randomGlitch > .025? 1. : 0.6;

    gl_FragColor = vec4(uColor, holographic);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}