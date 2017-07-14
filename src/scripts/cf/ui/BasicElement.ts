/// <reference path="../logic/EventDispatcher.ts"/>

// namespace
namespace cf {
	// interface
	export interface IBasicElementOptions{
		eventTarget: EventDispatcher;
		cfReference?: ConversationalForm,
		// set a custom template
		customTemplate?: string
	}

	export interface IBasicElement{
		el: HTMLElement;
		// template, can be overwritten ...
		getTemplate(): string;
		dealloc(): void;
	}

	// class
	export class BasicElement implements IBasicElement{
		public el: HTMLElement;
		protected eventTarget: EventDispatcher;
		protected cfReference: ConversationalForm;
		// optional value, but this can be used to overwrite the UI of Conversational Interface
		protected customTemplate: string;

		constructor(options: IBasicElementOptions){
			this.eventTarget = options.eventTarget;
			this.cfReference = options.cfReference;

			if(options.customTemplate)
				this.customTemplate = options.customTemplate;

			// TODO: remove
			if(!this.eventTarget)
				throw new Error("this.eventTarget not set!! : " + (<any>this.constructor).name);

			this.setData(options);
			this.createElement();
			this.onElementCreated();
		}

		protected setData(options: IBasicElementOptions){
			
		}

		protected onElementCreated(){
			
		}

		private createElement(): Element{
			var template: HTMLTemplateElement = document.createElement('template');
			template.innerHTML = this.getTemplate();
			this.el = <HTMLElement> template.firstChild || <HTMLElement>template.content.firstChild;
			return this.el;
		}

		// template, should be overwritten ...
		public getTemplate () : string {return this.customTemplate || `should be overwritten...`};

		public dealloc(){
			this.el.parentNode.removeChild(this.el);
		}
	}
}