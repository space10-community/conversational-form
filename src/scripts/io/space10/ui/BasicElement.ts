// namespace
namespace io.space10 {
	// interface
	export interface IBasicElementOptions{

	}

	export interface IBasicElement{
		el: Element;
		// template, can be overwritten ...
		getTemplate(): string;
	}

	// class
	export class BasicElement implements IBasicElement{
		public el: Element;

		constructor(options: IBasicElementOptions){
			this.setData(options);
			this.createElement();
		}

		protected setData(options: IBasicElementOptions){
			
		}

		protected createElement(): Element{
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