/// <reference path="ControlElement.d.ts" />
declare namespace cf {
    class Button extends ControlElement {
        private clickCallback;
        private mouseDownCallback;
        readonly type: string;
        constructor(options: IControlElementOptions);
        private onMouseDown(event);
        protected onClick(event: MouseEvent): void;
        dealloc(): void;
        getTemplate(): string;
    }
}
