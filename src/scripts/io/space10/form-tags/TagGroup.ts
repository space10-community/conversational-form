/// <reference path="InputTag.ts"/>

// group tags together, this is done automatically by looking through InputTags with type radio or checkbox and same name attribute.
// single choice logic for Radio Button, <input type="radio", where name is the same
// multi choice logic for Checkboxes, <input type="checkbox", where name is the same


// namespace
namespace io.space10 {
	// interface
	export interface ITagGroupOptions{
		elements: Array <InputTag>;
	}

	export interface ITagGroup extends ITag{
		// elements: Array <InputTag>
	}

	// class
	export class TagGroup implements ITagGroup {
		public elements: Array <InputTag>;

		public get type (): string{
			return "group";
		}

		public get name (): string{
			return this.elements[0].name;
		}

		constructor(options: ITagGroupOptions){
			this.elements = options.elements;
			console.log(this, 'TagGroup:', this.elements);
		}
	}
}