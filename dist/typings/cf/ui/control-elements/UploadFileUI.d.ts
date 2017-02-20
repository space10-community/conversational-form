/// <reference path="Button.d.ts" />
/// <reference path="../../logic/Helpers.d.ts" />
declare namespace cf {
    class UploadFileUI extends Button {
        private maxFileSize;
        private onDomElementChangeCallback;
        private progressBar;
        private loading;
        private submitTimer;
        private _fileName;
        private _readerResult;
        private _files;
        readonly value: string;
        readonly readerResult: string;
        readonly files: FileList;
        readonly fileName: string;
        readonly type: string;
        constructor(options: IControlElementOptions);
        private onDomElementChange(event);
        animateIn(): void;
        protected onClick(event: MouseEvent): void;
        triggerFileSelect(): void;
        dealloc(): void;
        getTemplate(): string;
    }
}
