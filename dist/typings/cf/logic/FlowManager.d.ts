/// <reference path="../form-tags/Tag.d.ts" />
/// <reference path="../ConversationalForm.d.ts" />
declare namespace cf {
    interface FlowDTO {
        text?: string;
        errorText?: string;
        input?: UserInput;
        controlElements?: Array<IControlElement>;
    }
    interface FlowManagerOptions {
        cuiReference: ConversationalForm;
        tags: Array<ITag>;
    }
    const FlowEvents: {
        USER_INPUT_UPDATE: string;
        USER_INPUT_INVALID: string;
        FLOW_UPDATE: string;
    };
    class FlowManager {
        private static STEP_TIME;
        static generalFlowStepCallback: (dto: FlowDTO, success: () => void, error: (optionalErrorMessage?: string) => void) => void;
        private cuiReference;
        private tags;
        private stopped;
        private maxSteps;
        private step;
        private savedStep;
        private stepTimer;
        private userInputSubmitCallback;
        readonly currentTag: ITag | ITagGroup;
        constructor(options: FlowManagerOptions);
        userInputSubmit(event: CustomEvent): void;
        startFrom(indexOrTag: number | ITag): void;
        start(): void;
        stop(): void;
        nextStep(): void;
        previousStep(): void;
        addStep(): void;
        dealloc(): void;
        /**
        * @name editTag
        * go back in time and edit a tag.
        */
        editTag(tag: ITag): void;
        private skipStep();
        private validateStepAndUpdate();
        private showStep();
    }
}
