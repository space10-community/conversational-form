/// <reference path="../logic/EventDispatcher.ts"/>

// namespace
namespace cf {
	// interface
	export interface IBasicElementOptions{
		eventTarget: EventDispatcher;
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

		constructor(options: IBasicElementOptions){
			this.eventTarget = options.eventTarget;

			// TODO: remove
			if(!this.eventTarget)
				throw new Error("this.eventTarget not set!! : " + (<any>this.constructor).name);

			this.setData(options);
			this.createElement();
		}

		protected setData(options: IBasicElementOptions){
			
		}

		protected createElement(): Element{
			var template: HTMLTemplateElement = document.createElement('template');
			template.innerHTML = this.getTemplate();
			this.el = <HTMLElement> template.firstChild || <HTMLElement>template.content.firstChild;
			return this.el;
		}

		// template, should be overwritten ...
		public getTemplate () : string {return `should be overwritten...`};

		public dealloc(){
			this.el.parentNode.removeChild(this.el);
		}
	}
}