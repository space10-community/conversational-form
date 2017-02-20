/// <reference path="Button.d.ts" />
/// <reference path="ControlElement.d.ts" />
/// <reference path="RadioButton.d.ts" />
/// <reference path="CheckboxButton.d.ts" />
/// <reference path="OptionsList.d.ts" />
/// <reference path="UploadFileUI.d.ts" />
/// <reference path="../ScrollController.d.ts" />
/// <reference path="../chat/ChatResponse.d.ts" />
declare namespace cf {
    interface ControlElementsDTO {
        height: number;
    }
    interface IControlElementsOptions {
        el: HTMLElement;
    }
    class ControlElements {
        private elements;
        private el;
        private list;
        private infoElement;
        private currentControlElement;
        private ignoreKeyboardInput;
        private rowIndex;
        private columnIndex;
        private tableableRows;
        private userInputUpdateCallback;
        private onChatRobotReponseCallback;
        private onUserInputKeyChangeCallback;
        private onElementFocusCallback;
        private onScrollCallback;
        private elementWidth;
        private filterListNumberOfVisible;
        private listScrollController;
        private rAF;
        private listWidth;
        readonly active: boolean;
        readonly focus: boolean;
        disabled: boolean;
        readonly length: number;
        constructor(options: IControlElementsOptions);
        private onScroll(event);
        private onElementFocus(event);
        private updateRowColIndexFromVector(vector);
        private onChatRobotReponse(event);
        private onUserInputKeyChange(event);
        private validateRowColIndexes();
        private updateRowIndex(direction);
        private resetTabList();
        private onUserInputUpdate(event);
        private filterElementsFrom(value);
        private animateElementsIn();
        private getElements();
        /**
        * @name buildTabableRows
        * build the tabable array index
        */
        private buildTabableRows();
        resetAfterErrorMessage(): void;
        focusFrom(angle: string): void;
        updateStateOnElements(controlElement: IControlElement): void;
        reset(): void;
        getElement(index: number): IControlElement | OptionsList;
        getDTO(): FlowDTO;
        buildTags(tags: Array<ITag>): void;
        resize(resolve?: any, reject?: any): void;
        dealloc(): void;
    }
}
