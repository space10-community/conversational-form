/// <reference path="ChatResponse.d.ts" />
/// <reference path="../BasicElement.d.ts" />
/// <reference path="../../logic/FlowManager.d.ts" />
declare namespace cf {
    const ChatListEvents: {
        CHATLIST_UPDATED: string;
    };
    class ChatList extends BasicElement {
        private flowUpdateCallback;
        private userInputUpdateCallback;
        private onInputKeyChangeCallback;
        private currentResponse;
        private currentUserResponse;
        private flowDTOFromUserInputUpdate;
        private responses;
        constructor(options: IBasicElementOptions);
        private onInputKeyChange(event);
        private onUserInputUpdate(event);
        private onFlowUpdate(event);
        /**
        * @name onUserAnswerClicked
        * on user ChatReponse clicked
        */
        onUserWantToEditPreviousAnswer(tag: ITag): void;
        /**
        * @name setCurrentResponse
        * Update current reponse, is being called automatically from onFlowUpdate, but can also in rare cases be called automatically when flow is controlled manually.
        * reponse: FlowDTO
        */
        setCurrentResponse(response: FlowDTO): void;
        updateThumbnail(robot: boolean, img: string): void;
        createResponse(isRobotReponse: boolean, currentTag: ITag, value?: string): void;
        getTemplate(): string;
        dealloc(): void;
    }
}
