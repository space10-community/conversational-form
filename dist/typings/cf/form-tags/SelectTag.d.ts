/// <reference path="Tag.d.ts" />
declare namespace cf {
    class SelectTag extends Tag {
        optionTags: Array<OptionTag>;
        private _values;
        readonly type: string;
        readonly value: string | Array<string>;
        readonly multipleChoice: boolean;
        constructor(options: ITagOptions);
        setTagValueAndIsValid(dto: FlowDTO): boolean;
    }
}
