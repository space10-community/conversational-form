/// <reference path="../data/Dictionary.d.ts" />
/// <reference path="InputTag.d.ts" />
/// <reference path="ButtonTag.d.ts" />
/// <reference path="SelectTag.d.ts" />
/// <reference path="OptionTag.d.ts" />
/// <reference path="../ConversationalForm.d.ts" />
declare namespace cf {
    interface ITag {
        domElement?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement;
        type: string;
        name: string;
        label: string;
        question: string;
        errorMessage: string;
        setTagValueAndIsValid(dto: FlowDTO): boolean;
        dealloc(): void;
        refresh(): void;
        value: string | Array<string>;
        inputPlaceholder?: string;
        required: boolean;
        defaultValue: string | number;
        disabled: boolean;
        validationCallback?(dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void): void;
    }
    interface ITagOptions {
        domElement?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement;
        questions?: Array<string>;
        label?: string;
        validationCallback?: (dto: FlowDTO, success: () => void, error: () => void) => void;
    }
    class Tag implements ITag {
        domElement: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement;
        private errorMessages;
        private pattern;
        protected _inputPlaceholder: string;
        protected _label: string;
        defaultValue: string | number;
        protected questions: Array<string>;
        validationCallback?: (dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void) => void;
        readonly type: string;
        readonly name: string;
        readonly inputPlaceholder: string;
        readonly label: string;
        readonly value: string | Array<string>;
        readonly disabled: boolean;
        readonly required: boolean;
        readonly question: string;
        readonly errorMessage: string;
        constructor(options: ITagOptions);
        dealloc(): void;
        static isTagValid(element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement): boolean;
        static createTag(element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement): ITag;
        refresh(): void;
        setTagValueAndIsValid(dto: FlowDTO): boolean;
        protected findAndSetQuestions(): void;
        protected findAndSetLabel(): void;
    }
}
