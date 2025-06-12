attribute float aIntensity;
attribute float aAngle;

uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;


varying vec3 vColor;


void main() {
    // Displaement
    vec3 newPosition = position;
    float displacementIntensity = texture2D(uDisplacementTexture, uv).r;
    displacementIntensity = smoothstep(0.1, .3, displacementIntensity);
    newPosition.z += displacementIntensity;

    vec3 displacement = vec3(
        cos(aAngle) * .5,
        sin(aAngle) * .5,
        1.
    );

    displacement = normalize(displacement);

    displacement *= displacementIntensity * 3.0 * aIntensity;

    newPosition += displacement;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    float pictureIntensity = texture2D(uPictureTexture, uv).r;
    // float pictureIntensity = texture2D(uDisplacementTexture, uv).r;

    // Point size
    gl_PointSize = 0.15 * uResolution.y * pictureIntensity;
    gl_PointSize *= (1.0 / -viewPosition.z);

    vColor = vec3(pow(pictureIntensity, 2.));
}