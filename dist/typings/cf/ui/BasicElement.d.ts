declare namespace cf {
    interface IBasicElementOptions {
    }
    interface IBasicElement {
        el: HTMLElement;
        getTemplate(): string;
        dealloc(): void;
    }
    class BasicElement implements IBasicElement {
        el: HTMLElement;
        constructor(options: IBasicElementOptions);
        protected setData(options: IBasicElementOptions): void;
        protected createElement(): Element;
        getTemplate(): string;
        dealloc(): void;
    }
}
