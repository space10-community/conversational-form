/// <reference path="ControlElement.ts"/>
/// <reference path="../../form-tags/OptionTag.ts"/>
/// <reference path="OptionButton.ts"/>

// namespace
namespace cf {
	// interface

	export interface IOptionsListOptions{
		topList: HTMLUListElement;
		bottomList: HTMLUListElement;
		referenceTag: ITag;
	}

	// class
	// TODO: no need for this to be a ControlElement..
	export class OptionsList {

		private topList: HTMLUListElement;
		private bottomList: HTMLUListElement;
		private referenceTag: ITag;
		private elements: Array<OptionButton>;

		constructor(options: IOptionsListOptions){
			this.topList = options.topList;
			this.bottomList = options.bottomList;
			this.referenceTag = options.referenceTag;
			this.createElements();
		}

		public get type():string{
			return "OptionsList";
		}

		private createElements(){
			this.elements = [];
			var optionTags: NodeListOf<HTMLOptionElement> = this.referenceTag.domElement.getElementsByTagName("option");
			for (let i = 0; i < optionTags.length; i++) {
				let element: HTMLOptionElement = <HTMLOptionElement>optionTags[i];
				let tag: ITag = cf.Tag.createTag({
					domElement: element
				});

				if(tag){
					const btn: OptionButton = new OptionButton({
						referenceTag: tag
					});

					this.elements.push(btn);

					if(i % 2 == 0){
						this.topList.appendChild(btn.el);
					}else{
						this.bottomList.appendChild(btn.el);
					}
				}
			}
		}

		public remove(){
			while(this.elements.length > 0)
				this.elements.pop().remove();
			this.elements = null;
		}
	}
}

