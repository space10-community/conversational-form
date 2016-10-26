// namespace
namespace io.space10 {

	export interface IDictionaryOptions{
		data?: Object;
	}
	// class
	export class Dictionary{
		private static instance: Dictionary;
		constructor(options?: IDictionaryOptions){
			Dictionary.instance = this;

			// allow for overwritting
			// should validate the data??
			if(options && options.data)
				this.data = options.data;
		}

		public static get(id:string): string{
			const ins: Dictionary = Dictionary.instance;
			let value: string = ins.data[id];
			if(!value)
				value = ins.data["entry-not-found"];

			return value;
		}

		public static set(id:string, value: string){
			const ins: Dictionary = Dictionary.instance;
			ins.data[id] = value;
		}

		// can be overwritten
		protected data: any = {
			"entry-not-found": "Dictionary item not found.",
			"input-placeholder": "Hello mellow..",
		}
	}
}