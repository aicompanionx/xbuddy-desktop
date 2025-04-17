declare module 'pixi-live2d-display' {
    import * as PIXI from 'pixi.js';

    export class Live2DModel extends PIXI.Container {
        static from(modelPath: string): Promise<Live2DModel>;
        internalModel: {
            focus?: (x: number, y: number) => void;
            motion?: (name: string) => void;
            definition?: {
                motions?: Record<string, unknown>;
            };
        };
        scale: PIXI.Point;
        position: PIXI.Point;
        anchor: PIXI.Point;
    }
}

declare module 'pixi-live2d-display' {
    import * as PIXI from 'pixi.js';

    export class Live2DModel {
        static from(modelPath: string): Promise<Live2DModel & PIXI.Container>;
        scale: { set: (scale: number) => void };
        position: { set: (x: number, y: number) => void };
        anchor: { set: (x: number, y: number) => void };
        internalModel: unknown;
    }
}

interface Window {
    PIXI: typeof import('pixi.js');
    Live2D: unknown;
}