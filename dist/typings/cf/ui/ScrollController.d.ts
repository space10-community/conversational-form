/// <reference path="../logic/Helpers.d.ts" />
declare namespace cf {
    interface IScrollControllerOptions {
        interactionListener: HTMLElement;
        listToScroll: HTMLElement;
        listNavButtons: NodeListOf<Element>;
    }
    class ScrollController {
        static accerlation: number;
        private interactionListener;
        private listToScroll;
        private listWidth;
        private prevButton;
        private nextButton;
        private rAF;
        private visibleAreaWidth;
        private max;
        private onListNavButtonsClickCallback;
        private documentLeaveCallback;
        private onInteractStartCallback;
        private onInteractEndCallback;
        private onInteractMoveCallback;
        private interacting;
        private x;
        private xTarget;
        private startX;
        private startXTarget;
        private mouseSpeed;
        private mouseSpeedTarget;
        private direction;
        private directionTarget;
        private inputAccerlation;
        private inputAccerlationTarget;
        constructor(options: IScrollControllerOptions);
        private onListNavButtonsClick(event);
        private documentLeave(event);
        private onInteractStart(event);
        private onInteractEnd(event);
        private onInteractMove(event);
        private render();
        setScroll(x: number, y: number): void;
        pushDirection(dir: number): void;
        dealloc(): void;
        reset(): void;
        resize(listWidth: number, visibleAreaWidth: number): void;
    }
}
