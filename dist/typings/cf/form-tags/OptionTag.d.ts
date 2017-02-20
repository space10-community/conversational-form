/// <reference path="Tag.d.ts" />
declare namespace cf {
    class OptionTag extends Tag {
        readonly type: string;
        readonly label: string;
        selected: boolean;
        setTagValueAndIsValid(value: FlowDTO): boolean;
    }
}
