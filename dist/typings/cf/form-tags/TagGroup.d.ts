/// <reference path="ButtonTag.d.ts" />
/// <reference path="InputTag.d.ts" />
/// <reference path="SelectTag.d.ts" />
/// <reference path="../ui/UserInput.d.ts" />
declare namespace cf {
    interface ITagGroupOptions {
        elements: Array<ITag>;
    }
    interface ITagGroup extends ITag {
        elements: Array<ITag>;
        getGroupTagType: () => string;
        refresh(): void;
        dealloc(): void;
        required: boolean;
        disabled: boolean;
    }
    class TagGroup implements ITagGroup {
        private onInputKeyChangeCallback;
        private _values;
        defaultValue: string;
        elements: Array<ITag>;
        readonly required: boolean;
        readonly type: string;
        readonly name: string;
        readonly label: string;
        readonly question: string;
        readonly value: Array<string>;
        readonly disabled: boolean;
        readonly errorMessage: string;
        constructor(options: ITagGroupOptions);
        dealloc(): void;
        refresh(): void;
        getGroupTagType(): string;
        setTagValueAndIsValid(value: FlowDTO): boolean;
    }
}
