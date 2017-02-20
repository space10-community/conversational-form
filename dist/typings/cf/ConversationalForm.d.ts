/// <reference path="ui/UserInput.d.ts" />
/// <reference path="ui/chat/ChatList.d.ts" />
/// <reference path="logic/FlowManager.d.ts" />
/// <reference path="form-tags/Tag.d.ts" />
/// <reference path="form-tags/TagGroup.d.ts" />
/// <reference path="form-tags/InputTag.d.ts" />
/// <reference path="form-tags/SelectTag.d.ts" />
/// <reference path="form-tags/ButtonTag.d.ts" />
/// <reference path="data/Dictionary.d.ts" />
interface Window {
    ConversationalForm: any;
}
declare namespace cf {
    interface ConversationalFormOptions {
        tags?: Array<ITag>;
        formEl: HTMLFormElement;
        context?: HTMLElement;
        dictionaryData?: Object;
        dictionaryRobot?: Object;
        userImage?: string;
        robotImage?: string;
        submitCallback?: () => void | HTMLButtonElement;
        loadExternalStyleSheet?: boolean;
        preventAutoAppend?: boolean;
        scrollAccerlation?: number;
        flowStepCallback?: (dto: FlowDTO, success: () => void, error: () => void) => void;
    }
    class ConversationalForm {
        static animationsEnabled: boolean;
        dictionary: Dictionary;
        el: HTMLElement;
        private context;
        private formEl;
        private submitCallback;
        private onUserAnswerClickedCallback;
        private tags;
        private flowManager;
        private chatList;
        private userInput;
        private isDevelopment;
        private loadExternalStyleSheet;
        private preventAutoAppend;
        constructor(options: ConversationalFormOptions);
        init(): ConversationalForm;
        /**
        * @name updateDictionaryValue
        * set a dictionary value at "runtime"
        *	id: string, id of the value to update
        *	type: string, "human" || "robot"
        *	value: string, value to be inserted
        */
        updateDictionaryValue(id: string, type: string, value: string): void;
        getFormData(): FormData;
        addRobotChatResponse(response: string): void;
        stop(optionalStoppingMessage?: string): void;
        start(): void;
        getTag(nameOrIndex: string | number): ITag;
        private setupTagGroups();
        private setupUI();
        /**
        * @name onUserAnswerClicked
        * on user ChatReponse clicked
        */
        private onUserAnswerClicked(event);
        /**
        * @name remapTagsAndStartFrom
        * index: number, what index to start from
        * setCurrentTagValue: boolean, usually this method is called when wanting to loop or skip over questions, therefore it might be usefull to set the valie of the current tag before changing index.
        */
        remapTagsAndStartFrom(index?: number, setCurrentTagValue?: boolean): void;
        doSubmitForm(): void;
        remove(): void;
        static ILLUSTRATE_APP_FLOW: boolean;
        static illustrateFlow(classRef: any, type: string, eventType: string, detail?: any): void;
    }
}
