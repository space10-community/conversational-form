/// <reference path="ControlElement.d.ts" />
/// <reference path="OptionButton.d.ts" />
declare namespace cf {
    interface IOptionsListOptions {
        context: HTMLElement;
        referenceTag: ITag;
    }
    class OptionsList {
        elements: Array<OptionButton>;
        private context;
        private multiChoice;
        private referenceTag;
        private onOptionButtonClickCallback;
        readonly type: string;
        constructor(options: IOptionsListOptions);
        getValue(): Array<OptionButton>;
        private onOptionButtonClick(event);
        private createElements();
        dealloc(): void;
    }
}
