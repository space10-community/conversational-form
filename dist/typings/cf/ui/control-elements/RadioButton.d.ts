/// <reference path="Button.d.ts" />
declare namespace cf {
    class RadioButton extends Button {
        readonly type: string;
        checked: boolean;
        protected onClick(event: MouseEvent): void;
        getTemplate(): string;
    }
}
