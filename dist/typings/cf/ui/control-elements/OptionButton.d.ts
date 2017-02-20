/// <reference path="Button.d.ts" />
declare namespace cf {
    interface IOptionButtonOptions extends IControlElementOptions {
        isMultiChoice: boolean;
    }
    const OptionButtonEvents: {
        CLICK: string;
    };
    class OptionButton extends Button {
        private isMultiChoice;
        readonly type: string;
        selected: boolean;
        protected setData(options: IOptionButtonOptions): void;
        protected onClick(event: MouseEvent): void;
        getTemplate(): string;
    }
}
