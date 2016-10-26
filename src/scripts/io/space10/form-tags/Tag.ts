// basic tag from form logic
// types:
// radio
// text
// email
// tel
// password
// checkbox
// radio
// select
// button


// namespace
namespace io.space10 {
	// interface
	export interface ITag{
		el?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement,
		type: string,
		name: string,
		title: string,
	}

	export interface ITagOptions{
		el?: HTMLInputElement | HTMLSelectElement | HTMLButtonElement,
		questions?: Array<String>,
		validationCallback?: () => void,
	}

	// class
	export class Tag implements ITag {
		public el: HTMLInputElement | HTMLSelectElement | HTMLButtonElement;
		
		protected defaultValue: string | number;

		private validationCallback?: () => void;
		private questions: Array<String>;

		public get type (): string{
			return this.el.getAttribute("type");
		}

		public get name (): string{
			return this.el.getAttribute("name");
		}
		
		public get title (): string{
			return this.el.getAttribute("title");
		}

		constructor(options: ITagOptions){
			this.el = options.el;

			if(options.questions)
				this.questions = options.questions;
			
			if(this.validationCallback)
				this.validationCallback = options.validationCallback;

			this.defaultValue = this.el.value;
		}

		public static isTagValid(element: HTMLInputElement | HTMLSelectElement | HTMLButtonElement):boolean{
			if(element.getAttribute("type") === "hidden")
				return false;
			
			if(element.style.display === "none")
				return false;
			
			if(element.style.visibility === "hidden")
				return false;


			return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		}

		protected setValue(value: string | number){
			// validation?
			this.el.value = value.toString();
		}
	}
}

