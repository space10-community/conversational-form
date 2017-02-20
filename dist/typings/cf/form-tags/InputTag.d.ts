/// <reference path="Tag.d.ts" />
declare namespace cf {
    class InputTag extends Tag {
        constructor(options: ITagOptions);
        protected findAndSetQuestions(): void;
        protected findAndSetLabel(): void;
        setTagValueAndIsValid(value: FlowDTO): boolean;
        dealloc(): void;
    }
}
