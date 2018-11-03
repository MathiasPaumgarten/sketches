uniform sampler2D positionTexture;
uniform sampler2D velocityTexture;

attribute vec2 reference;

varying float speed;

void main() {
    vec3 particlePosition = texture2D( positionTexture, reference ).xyz;
    vec3 particleVelocity = texture2D( velocityTexture, reference ).xyz;

    speed = length( particleVelocity );

    float size = floor( fract( reference.x ) * 10.0 ) / 2.0;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( particlePosition.xyz, 1.0 );
    gl_PointSize = size;
}