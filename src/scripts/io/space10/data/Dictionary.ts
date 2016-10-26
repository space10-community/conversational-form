// namespace
namespace io.space10 {

	export interface IDictionaryOptions{
		data?: Object;
		aiQuestions?: Object;
	}
	// class
	export class Dictionary{
		private static instance: Dictionary;
		constructor(options?: IDictionaryOptions){
			Dictionary.instance = this;

			// allow for overwritting
			
			// TODO: should validate key values from new data
			if(options && options.data)
				this.data = options.data;
			
			if(options && options.aiQuestions)
				this.AIQuestions = options.aiQuestions;
		}

		public static get(id:string): string{
			const ins: Dictionary = Dictionary.instance;
			let value: string = ins.data[id];
			if(!value)
				value = ins.data["entry-not-found"];

			return value;
		}

		public static getAIResponse(tagType:string): string{
			const ins: Dictionary = Dictionary.instance;
			let value: string = ins.AIQuestions[Dictionary.AIType][tagType];
			if(!value){
				// value not found, so pick a general one
				const generals: Array<string> = ins.AIQuestions[Dictionary.AIType]["general"].split("|");
				value = generals[Math.floor(Math.random() * generals.length)];
			}

			return value;
		}

		// can be overwritten
		protected data: any = {
			"entry-not-found": "Dictionary item not found.",
			"input-placeholder": "Hello mellow..",
		}

		// default...
		public static AIType = "robot";
		protected AIQuestions: any = {
			"robot": {
				"name": "Your name?",
				"email": "Fill out your e-mail",
				"password": "Password needed",
				"tel": "Insert telephone number",
				"radio": "I need you to select one of these",
				"checkbox": "As many as you want.",
				"select": "Choose from the dropdown",
				"general": "Lala|Crazy monkey|What?",
			},
			"sonny": {
				"name": "I am wondering wht your name is..?",
				"email": "Fill out your e-mail",
				"password": "Password needed",
				"tel": "Insert telephone number",
				"radio": "I need you to select one of these",
				"checkbox": "As many as you want.",
				"select": "Choose from the dropdown",
				"general": "Lala|Crazy monkey|What?",
			},
		}
	}
}