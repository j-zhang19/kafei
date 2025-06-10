uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;
attribute float aTimeMultiplier;

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax) {
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

void main(){
    vec3 newPosition = position;

    float progress = uProgress * aTimeMultiplier;

    float explosionProgress = remap(progress, .0, .1, .0, 1.);
    explosionProgress = clamp(explosionProgress, .0, 1.);
    explosionProgress = 1. - pow(1. - explosionProgress, 3.);
    newPosition *= explosionProgress;

    float fallProgress = remap(progress, 0.1, 1.0, 0.0, 1.0);
    fallProgress = clamp(fallProgress, 0., 1.);
    fallProgress = 1. - pow(1. - fallProgress, 3.);
    newPosition.y -= fallProgress * .2;

    float scaleUpProgress = remap(progress, 0.0, .125, .0, 1.);
    float scaleDownProgress = remap(progress, 0.125, 1., 1., 0.);
    float scaleProgress = min(progress, scaleDownProgress);
    scaleProgress = clamp(scaleProgress, .0, 1.);

    float twinkleProgress = remap(progress, .2, .8, .0, 1.);
    twinkleProgress = clamp(twinkleProgress, 0.0, 1.0);
    float sizeTwinkling = sin(progress * 30.) * .5 + .5;
    sizeTwinkling = 1. - sizeTwinkling * twinkleProgress;


    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.);
    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position = projectionMatrix * viewPosition;
    
    gl_PointSize = uSize * uResolution.y * aSize * scaleProgress * sizeTwinkling;
    gl_PointSize *= 1. / - viewPosition.z;


    if (gl_PointSize < 1.) {
        gl_Position = vec4(9999.99);
    }
}