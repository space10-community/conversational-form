// namespace
namespace io.space10 {
	// interface

	// class

	export interface IBasicElementOptions{

	}

	export interface IBasicElement{
		el: Element;
		// template, can be overwritten ...
		getTemplate(): string;
	}

	export class BasicElement implements IBasicElement{
		public el: Element;

		constructor(options: IBasicElementOptions){
			this.createElement(options);
		}

		protected createElement(options: IBasicElementOptions): Element{
			var template: HTMLTemplateElement = document.createElement('template');
			template.innerHTML = this.getTemplate();
			this.el = <Element> template.content.firstChild;
			return this.el;
		}

		// template, should be overwritten ...
		public getTemplate () : string {return `template missing...`};

		public remove(){

		}
	}
}