// namespace
namespace cf {
	// interface

	// class
	export interface DataTag extends Object{
		tag: string; // input, select etc.
		type: string; // "password", "text" etc.
		children: Array<DataTag>; // "password", "text" etc.
		// TODO: extend native tag interface?
	}
	export class TagsParser {
		public static parseTag(element: DataTag) : HTMLElement | HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement{
			const tag: HTMLElement | HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement = <HTMLInputElement | HTMLSelectElement | HTMLButtonElement | HTMLOptionElement> document.createElement(element.tag)
			tag.setAttribute("cf-formless", "");
			
			// TODO: ES6 mapping??
			for(var k in element){
				if(k !== "tag"){
					tag.setAttribute(k, (<any> element)[k])
				}
			}

			
			return tag;

		}

		public static parseGroupTag(groupTag: DataTag) : HTMLElement {
			const groupEl: HTMLElement = TagsParser.parseTag(groupTag);
			const groupChildren: Array<DataTag> = groupTag.children;
			for (let j = 0; j < groupChildren.length; j++) {
				let fieldSetTagData: DataTag = groupChildren[j];
				let tag: HTMLElement = TagsParser.parseTag(fieldSetTagData);
				groupEl.appendChild(tag);
			}
			return groupEl;
		}

		public static parseJSONIntoElements(data: any) : HTMLFormElement{
			const formEl: HTMLFormElement = document.createElement("form");
			for (let i = 0; i < data.length; i++) {
				let element: DataTag = <DataTag>data[i];
				const tag: HTMLElement = TagsParser.parseTag(element);

				// add sub children to tag, ex. option, checkbox, etc.
				if(element.children && element.children.length > 0){
					for (let j = 0; j < element.children.length; j++) {
						let subElement = TagsParser.parseTag(element.children[j]);
						tag.appendChild(subElement);
					}
				}
				
				formEl.appendChild(tag);
			}

			return formEl;
		}

		public static isElementFormless(element: HTMLElement): boolean{
			if(element.hasAttribute("cf-formless"))
				return true;

			return false;
		}
	}
}