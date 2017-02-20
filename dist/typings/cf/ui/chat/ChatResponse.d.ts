/// <reference path="../BasicElement.d.ts" />
/// <reference path="../../logic/Helpers.d.ts" />
/// <reference path="../../ConversationalForm.d.ts" />
declare namespace cf {
    interface IChatResponseOptions {
        response: string;
        image: string;
        isRobotReponse: boolean;
        tag: ITag;
    }
    const ChatResponseEvents: {
        ROBOT_QUESTION_ASKED: string;
        USER_ANSWER_CLICKED: string;
    };
    class ChatResponse extends BasicElement {
        isRobotReponse: boolean;
        private response;
        private image;
        private tag;
        private onClickCallback;
        visible: boolean;
        constructor(options: IChatResponseOptions);
        setValue(dto?: FlowDTO): void;
        updateThumbnail(src: string): void;
        /**
         * skippedBecauseOfEdit
         */
        skippedBecauseOfEdit(): void;
        /**
        * @name onClickCallback
        * click handler for el
        */
        private onClick(event);
        private processResponse();
        protected setData(options: IChatResponseOptions): void;
        dealloc(): void;
        getTemplate(): string;
    }
}
