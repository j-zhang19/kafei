uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;

#include ../includes/random2D.glsl

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Glitch
    float glitchTime = uTime - modelPosition.y;
    float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
    glitchStrength /= 3.;

    glitchStrength = smoothstep(.3, 1., glitchStrength);
    glitchStrength *= .2;
    modelPosition.x += (random2D(modelPosition.xz + uTime) - .5) * glitchStrength;
    modelPosition.z += (random2D(modelPosition.xz + uTime) - .5) * glitchStrength;

    // Final position
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vec4 modelNormal = modelMatrix * vec4(normal, 0.);

    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;
}