uniform sampler2D uPerlinTexture;
uniform float uTime;

varying vec2 vUv;

vec2 rotate2D(vec2 value, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    mat2 m = mat2(c, s, -s, c);

    return m * value;
}

void main(){
    vec3 newPosition = position;

    float twistPerlin = texture2D(
        uPerlinTexture,
        vec2(.5, uv.y * .2 - uTime * .01)
    ).r;
    float angle = twistPerlin * 10.;
    newPosition.xz = rotate2D(newPosition.xz, angle);


    vec2 windOffset = vec2(
        texture2D(uPerlinTexture, vec2(.25, uTime * .01)).r - .5,
        texture2D(uPerlinTexture, vec2(.75, uTime * .03)).r - .5
    );
    windOffset *= pow(uv.y, 3.) * 10.;
    newPosition.xz += windOffset;


    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.);

    vUv = uv;
}