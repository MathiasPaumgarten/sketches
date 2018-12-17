import { Vector2 } from "three";

import { Drawable } from "./shared";

const ZERO = new Vector2();

class Anchor {
    readonly successor = new Vector2();
    readonly predecessor = new Vector2();
    readonly position = new Vector2();

    private _legPercent: number = 0.25
    get legPercent() { return this._legPercent; }

    get distance(): number { return this._distance ;}

    constructor( private angle: number, private _distance: number ) {
        this.calculatePoints();
    }

    updateDistance( value: number ): void {
        this._distance = value;
        this.calculatePoints();
    }

    updateLegPercent( length: number ) {
        this._legPercent = length;
        this.calculateLegs();
    }

    private calculatePoints(): void  {
        this.position.copy( this.polarToCartesian( this.angle, this.distance ) );
        this.calculateLegs();
    }

    private calculateLegs(): void {
        this.successor.copy( this.createLeg( this._legPercent * this.distance, Math.PI / 2 ) );
        this.predecessor.copy( this.createLeg( this._legPercent * this.distance, - Math.PI / 2 ) );
    }

    private createLeg( length: number, angle: number ): Vector2 {
        return this.position
            .clone()
            .rotateAround( ZERO, angle )
            .normalize()
            .multiplyScalar( length )
            .add( this.position );
    }

    private polarToCartesian( angle: number, radius: number ): Vector2 {
        return new Vector2( radius * Math.cos( angle ), radius * Math.sin( angle ) );
    }
}

export class Circle implements Drawable {
    readonly anchors: Anchor[] = [];

    private readonly ANCHOR_AMOUNT = 8;

    get radius(): number { return this._radius; }
    set radius( value: number ) {
        this._radius = value;
        this.anchors.forEach( anchor => anchor.updateDistance( value ) );
    }

    constructor( private _radius = 200 ) {
        const slice = ( Math.PI * 2 ) / this.ANCHOR_AMOUNT;

        for ( let i = 0; i < this.ANCHOR_AMOUNT; i++ ) {
            const angle: number = i * slice;

            this.anchors.push( new Anchor( angle, this.radius) );
        }
    }

    draw( context: CanvasRenderingContext2D ) {

        context.beginPath();
        context.moveTo( this.anchors[ 0 ].position.x, this.anchors[ 0 ].position.y );

        for ( let i = 1; i < this.anchors.length; i++ ) {
            this.drawSegment( context, this.anchors[ i - 1 ], this.anchors[ i ] );
        }

        this.drawSegment( context, this.anchors[ this.anchors.length - 1 ], this.anchors[ 0 ] );

        context.stroke();
    }

    private drawSegment( context: CanvasRenderingContext2D,  previous: Anchor, current: Anchor ): void {
        context.bezierCurveTo(
            previous.successor.x, previous.successor.y,
            current.predecessor.x, current.predecessor.y,
            current.position.x, current.position.y
        );
    }
}

export class InterpolatedCircle extends Circle {

    constructor( private first: Circle, private last: Circle, public percent: number ) {
        super();
        this.update();
    }

    private update() {
        this.anchors.forEach( ( anchor: Anchor, i: number ) => {

            const distance: number = this.lerp(
                this.first.anchors[ i ].distance,
                this.last.anchors[ i ].distance,
                quadOut( this.percent )
            );

            const leg: number = this.lerp(
                this.first.anchors[ i ].legPercent,
                this.last.anchors[ i ].legPercent,
                this.percent,
            );

            anchor.updateDistance( distance );
            anchor.updateLegPercent( leg );
        } );
    }

    private lerp( a: number, b: number, t: number ): number {
        return ( 1 - t ) * a + t * b;
    }

}


// TODO: use from matdesl package.
function quadOut(t) {
    return -t * (t - 2.0)
}
