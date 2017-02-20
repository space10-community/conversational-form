/// <reference path="../../ConversationalForm.d.ts" />
/// <reference path="../BasicElement.d.ts" />
/// <reference path="../../form-tags/Tag.d.ts" />
declare namespace cf {
    interface ControlElementVector {
        height: number;
        width: number;
        x: number;
        y: number;
        centerX?: number;
        centerY?: number;
        el: cf.IControlElement;
    }
    interface IControlElementOptions extends IBasicElementOptions {
        referenceTag: ITag;
    }
    interface IControlElement extends IBasicElement {
        el: HTMLElement;
        referenceTag: ITag;
        type: string;
        value: string;
        positionVector: ControlElementVector;
        tabIndex: number;
        visible: boolean;
        focus: boolean;
        calcPosition(): void;
        dealloc(): void;
    }
    const ControlElementEvents: {
        SUBMIT_VALUE: string;
        PROGRESS_CHANGE: string;
        ON_FOCUS: string;
    };
    const ControlElementProgressStates: {
        BUSY: string;
        READY: string;
    };
    class ControlElement extends BasicElement implements IControlElement {
        el: HTMLElement;
        referenceTag: ITag;
        private animateInTimer;
        private _positionVector;
        private _focus;
        private onFocusCallback;
        private onBlurCallback;
        readonly type: string;
        readonly value: string;
        readonly positionVector: ControlElementVector;
        tabIndex: number;
        readonly focus: boolean;
        visible: boolean;
        constructor(options: IBasicElementOptions);
        private onBlur(event);
        private onFocus(event);
        calcPosition(): void;
        protected setData(options: IControlElementOptions): void;
        animateIn(): void;
        animateOut(): void;
        onChoose(): void;
        dealloc(): void;
    }
}
