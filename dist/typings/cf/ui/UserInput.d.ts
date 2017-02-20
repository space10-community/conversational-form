/// <reference path="BasicElement.d.ts" />
/// <reference path="control-elements/ControlElements.d.ts" />
/// <reference path="../logic/FlowManager.d.ts" />
declare namespace cf {
    interface InputKeyChangeDTO {
        dto: FlowDTO;
        keyCode: number;
        inputFieldActive: boolean;
    }
    const UserInputEvents: {
        SUBMIT: string;
        KEY_CHANGE: string;
        CONTROL_ELEMENTS_ADDED: string;
    };
    class UserInput extends BasicElement {
        static preventAutoFocus: boolean;
        static ERROR_TIME: number;
        el: HTMLElement;
        private inputElement;
        private submitButton;
        private currentValue;
        private windowFocusCallback;
        private flowUpdateCallback;
        private inputInvalidCallback;
        private onControlElementSubmitCallback;
        private onSubmitButtonClickCallback;
        private onInputFocusCallback;
        private onInputBlurCallback;
        private onControlElementProgressChangeCallback;
        private errorTimer;
        private shiftIsDown;
        private _disabled;
        private keyUpCallback;
        private keyDownCallback;
        private controlElements;
        private _currentTag;
        private _active;
        readonly active: boolean;
        visible: boolean;
        readonly currentTag: ITag | ITagGroup;
        disabled: boolean;
        constructor(options: IBasicElementOptions);
        getInputValue(): string;
        getFlowDTO(): FlowDTO;
        onFlowStopped(): void;
        private onInputChange();
        private inputInvalid(event);
        private setPlaceholder();
        private onFlowUpdate(event);
        private onControlElementProgressChange(event);
        private buildControlElements(tags);
        private onControlElementSubmit(event);
        private onSubmitButtonClick(event);
        private onKeyDown(event);
        private onKeyUp(event);
        private dispatchKeyChange(dto, keyCode);
        private windowFocus(event);
        private onInputBlur(event);
        private onInputFocus(event);
        setFocusOnInput(): void;
        private onEnterOrSubmitButtonSubmit(event?);
        private doSubmit();
        private resetValue();
        dealloc(): void;
        getTemplate(): string;
    }
}
