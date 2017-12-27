/// <reference path="../logic/Helpers.ts"/>

// namespace
namespace cf {

	export interface IKeyCodes{
		"left": number,
		"right": number,
		"down": number,
		"up": number,
		"backspace": number,
		"enter": number,
		"space": number,
		"shift": number,
		"tab": number,
	}

	export interface IDictionaryOptions{
		data?: Object;
		robotData?: Object;
		userImage: string;
		robotImage: string;
	}
	// class
	export class Dictionary{
		private static instance: Dictionary;

		constructor(options?: IDictionaryOptions){
			Dictionary.instance = this;

			// overwrite data if defined 
			if(options && options.data)
				this.data = this.validateAndSetNewData(options.data, this.data);

			// overwrite user image
			if(options.userImage)
				this.data["user-image"] = options.userImage;
			
			// overwrite robot image
			if(options.robotImage)
				this.robotData["robot-image"] = options.robotImage;
			
			// overwrite robot questions if defined
			if(options && options.robotData)
				this.robotData = this.validateAndSetNewData(options.robotData, this.robotData);
		}

		public static keyCodes: IKeyCodes = {
			"left": 37,
			"right": 39,
			"down": 40,
			"up": 38,
			"backspace": 8,
			"enter": 13,
			"space": 32,
			"shift": 16,
			"tab": 9,
		}

		public static get(id:string): string{
			const ins: Dictionary = Dictionary.instance;
			let value: string = ins.data[id];

			if(!value){
				value = ins.data["entry-not-found"];
			}else{
				const values: Array<string> = Helpers.getValuesOfBars(value);
				value = values[Math.floor(Math.random() * values.length)];
			}

			return value;
		}

		/**
		* @name set
		* set a dictionary value
		*	id: string, id of the value to update
		*	type: string, "human" || "robot"
		*	value: string, value to be inserted
		*/
		public static set(id:string, type: string, value: string): string{
			const ins: Dictionary = Dictionary.instance;
			let obj: any = type == "robot" ? ins.robotData : ins.data;

			obj[id] = value;
			return obj[id];
		}

		public static getRobotResponse(tagType:string): string{
			const ins: Dictionary = Dictionary.instance;
			let value: string = ins.robotData[tagType];
			if(!value){
				// value not found, so pick a general one
				let generals: Array<string> = Helpers.getValuesOfBars(ins.robotData["general"]);
				value = generals[Math.floor(Math.random() * generals.length)];
			}else{
				let values: Array<string> = Helpers.getValuesOfBars(value);
				value = values[Math.floor(Math.random() * values.length)];
			}

			return value;
		}

		public static parseAndGetMultiValueString(arr: Array<string>):string{
			// check ControlElement.ts for value(s)
			let value: string = "";
			for (let i = 0; i < arr.length; i++) {
				let str: string = <string>arr[i];
				let sym: string = (arr.length > 1 && i == arr.length - 2 ? Dictionary.get("user-reponse-and") : ", ");
				value += str + (i < arr.length - 1 ? sym : "");
			}

			return value;
		}

		private validateAndSetNewData(newData: any, originalDataObject: any){
			for(var key in originalDataObject){
				if(!newData[key]){
					console.warn("Conversational Form Dictionary warning, '"+key+"' value is undefined, mapping '"+key+"' to default value. See Dictionary.ts for keys.");
					newData[key] = originalDataObject[key];
				}
			}

			return newData;
		}

		// can be overwrittenMicrophone error
		protected data: any = {
			"user-image": "https://cf-4053.kxcdn.com/conversational-form/human.png",
			"entry-not-found": "Dictionary item not found.",
			"awaiting-mic-permission": "Awaiting mic permission",
			"user-audio-reponse-invalid": "I didn't get that, try again.",
			"microphone-terminal-error": "Audio input not supported",
			"input-placeholder": "Type your answer here ...",
			"group-placeholder": "Type to filter list ...",
			"input-placeholder-error": "Your input is not correct ...",
			"input-placeholder-required": "Input is required ...",
			"input-placeholder-file-error": "File upload failed ...",
			"input-placeholder-file-size-error": "File size too big ...",
			"input-no-filter": "No results found for <strong>{input-value}</strong>",
			"user-reponse-and": " and ",
			"user-reponse-missing": "Missing input ...",
			"user-reponse-missing-group": "Nothing selected ...",
			"general": "General type1||General type2",
			"icon-type-file": "<svg class='cf-icon-file' viewBox='0 0 10 14' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'><g transform='translate(-756.000000, -549.000000)' fill='#0D83FF'><g transform='translate(736.000000, 127.000000)'><g transform='translate(0.000000, 406.000000)'><polygon points='20 16 26.0030799 16 30 19.99994 30 30 20 30'></polygon></g></g></g></g></svg>",
		}

		// can be overwriten
		protected robotData: any = {
			"robot-image": "https://cf-4053.kxcdn.com/conversational-form/robot.png",
			"input": "Please write some text.",
			"text": "Please write some text.",
			"checkbox": "Select as many as you want.",
			"name": "What's your name?",
			"email": "Need your e-mail.",
			"password": "Please provide password",
			"tel": "What's your phone number?",
			"radio": "I need you to select one of these.",
			"select": "Choose any of these options.",
			"file": "Select a file to upload.",
			"general": "General1||General2||General3.."
		}
	}
}