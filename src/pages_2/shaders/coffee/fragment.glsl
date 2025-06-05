uniform sampler2D uPerlinTexture;
uniform float uTime;

varying vec2 vUv;

void main(){
    vec2 smokeUv = vUv;
    smokeUv.x *= .5;
    smokeUv.y *= .3;
    smokeUv.y -= uTime * .2;


    float smoke = texture2D(uPerlinTexture, smokeUv).r;
    smoke = smoothstep(.4, 1., smoke);

    smoke *= smoothstep(0., .1, vUv.x);
    smoke *= smoothstep(1., .9, vUv.x);
    smoke *= smoothstep(0., .1, vUv.y);
    smoke *= smoothstep(1., .4, vUv.y);


    gl_FragColor = vec4(.6, .3, .2, smoke);
    // gl_FragColor = vec4(1., 0., 0., 1.);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}