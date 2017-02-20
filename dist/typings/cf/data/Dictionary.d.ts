declare namespace cf {
    interface IKeyCodes {
        "left": number;
        "right": number;
        "down": number;
        "up": number;
        "enter": number;
        "space": number;
        "shift": number;
        "tab": number;
    }
    interface IDictionaryOptions {
        data?: Object;
        robotData?: Object;
        userImage: string;
        robotImage: string;
    }
    class Dictionary {
        private static instance;
        constructor(options?: IDictionaryOptions);
        static keyCodes: IKeyCodes;
        static get(id: string): string;
        /**
        * @name set
        * set a dictionary value
        *	id: string, id of the value to update
        *	type: string, "human" || "robot"
        *	value: string, value to be inserted
        */
        static set(id: string, type: string, value: string): string;
        static getRobotResponse(tagType: string): string;
        static parseAndGetMultiValueString(arr: Array<string>): string;
        private validateAndSetNewData(newData, originalDataObject);
        protected data: any;
        protected robotData: any;
    }
}
