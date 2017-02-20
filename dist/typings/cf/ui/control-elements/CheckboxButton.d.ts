/// <reference path="Button.d.ts" />
declare namespace cf {
    class CheckboxButton extends Button {
        readonly type: string;
        checked: boolean;
        protected onClick(event: MouseEvent): void;
        getTemplate(): string;
    }
}
