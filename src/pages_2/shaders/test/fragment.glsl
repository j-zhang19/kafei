#define PI 3.141592653589793

uniform float uTime;
uniform float uStep;

varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid) {
    return vec2(cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x, cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y);
}

vec4 permute(vec4 x) {
    return mod(((x * 34.) + 1.) * x, 289.);
}

vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x, gy.x);
    vec2 g10 = vec2(gx.y, gy.y);
    vec2 g01 = vec2(gx.z, gy.z);
    vec2 g11 = vec2(gx.w, gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 *
        vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}

void main() {
    // float strengthX = step(.4, mod(vUv.x * 10., 1.));
    // strengthX *= step(.8, mod(vUv.y * 10. + .2, 1.));
    // float strengthY = step(.8, mod(vUv.x * 10. + .2, 1.));
    // strengthY *= step(.4, mod(vUv.y * 10., 1.));
    // float strength = strengthX + strengthY;

    // float strength = max(abs(vUv.x - .5), abs(vUv.y - .5));
    // strength = step(.2, strength);

    // float strength = floor(vUv.x * 10.0) / 10.0;
    // strength += floor(vUv.y * 10.0) / 10.0;

    // vec2 gridUv = vec2(
    //     floor(vUv.x * 10.) / 10.,
    //     floor(vUv.y * 10.) / 10.
    // );
    // float strength = random(gridUv);

    // vec2 rotatedUv = rotate(vUv, PI/4.0, vec2(.5));
    // vec2 ligthUvX = vec2(rotatedUv.x * .1 + .45, rotatedUv.y * .5 + .25);
    // float strengthX = .015 / length(ligthUvX - .5);
    // vec2 ligthUvY = vec2(rotatedUv.y * .1 + .45, rotatedUv.x * .5 + .25);
    // float strengthY = .015 / length(ligthUvY - .5);
    // float strength = strengthX * strengthY;

    // vec2 wavedUv = vec2(
    //     vUv.x + sin(vUv.y * 100.) * .1,
    //     vUv.y + sin(vUv.x * 100.) * .1
    // );
    // float strength = 1. - step(.01, abs(distance(wavedUv, vec2(.5)) -.25));

    // float angle = atan(vUv.x - .5, vUv.y - .5);
    // angle /= 2. * PI;
    // angle += .5;
    // // angle = mod(angle * 20.0, 1.);
    // float strength = sin(angle * 100.);

    // float angle = atan(vUv.x - .5, vUv.y - .5);
    // angle /= 2. * PI;
    // angle += .5;
    // float sinusoid = sin(angle * 100.);
    // float radius = 0.25 + sinusoid * .01;
    // float strength = 1. - step(.01, abs(distance(vUv, vec2(.5)) - radius));

    // float strength = 1. - abs(cnoise(vUv * 20.));

    // float strength = sin(cnoise(vUv * 20.) * 20.);

    float strength = step(uStep, sin(cnoise(vUv * 20.) * sin(uTime) * 10. + .3));

    strength = clamp(strength, 0.0, 1.0);
    
    // colors
    vec3 blackColor = vec3(0.0);
    vec3 uvColor = vec3(vUv, .4);
    vec3 mixedColor = mix(blackColor, uvColor, strength);

    // gl_FragColor = vec4(vec3(strength), 1.0);
    gl_FragColor = vec4(mixedColor, 1.0);
}