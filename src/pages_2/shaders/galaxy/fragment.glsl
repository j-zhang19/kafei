uniform vec2 uPointRadius;

varying vec3 vColor;

void main(){
    // Disc
    // float strength = distance(gl_PointCoord, vec2(.5));
    // strength = 1. - step(.5, strength);

    // Diffuse
    float strength = distance(gl_PointCoord, vec2(.5));
    strength *= 2.;
    strength = 1. - strength;

    // Light point
    // float strength = distance(gl_PointCoord, vec2(.5));
    // strength = 1. - strength;
    // strength = pow(strength, 10.);

    vec3 color = mix(vec3(.0), vColor, strength);

    gl_FragColor = vec4(color, 1.);
}