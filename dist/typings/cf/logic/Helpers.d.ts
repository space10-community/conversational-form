declare namespace cf {
    interface TouchVector2d {
        x: number;
        y: number;
        touches: Array<any>;
    }
    class Helpers {
        static lerp(norm: number, min: number, max: number): number;
        static norm(value: number, min: number, max: number): number;
        static getXYFromMouseTouchEvent(event: Event | MouseEvent | TouchEvent): TouchVector2d;
        static getInnerTextOfElement(element: Element): string;
        static getMouseEvent(eventString: string): string;
        static caniuse: {
            fileReader: () => boolean;
        };
        private static emojilib;
        static setEmojiLib(lib?: string, scriptSrc?: string): void;
        static emojify(str: string): string;
        static setTransform(el: any, transformString: string): void;
    }
}
