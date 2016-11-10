/// <reference path="Tag.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class InputTag extends Tag {
		constructor(options: ITagOptions){
			super(options);

			if(this.type == "text"){

			}else if(this.type == "email"){

			}else if(this.type == "tel"){

			}else if(this.type == "checkbox"){

			}else if(this.type == "radio"){

			}else if(this.type == "password"){

			}else if(this.type == "file"){
				// check InputFileTag.ts
			}
		}

		protected findAndSetQuestions(){
			super.findAndSetQuestions();

			// special use cases for <input> tag add here...
		}

		protected findAndSetLabel(){
			super.findAndSetLabel();

			if(!this._label){
				// special use cases for <input> tag add here...
			}
		}

		public setTagValueAndIsValid(value: FlowDTO):boolean{
			if(this.type == "checkbox"){
				// checkbox is always true..
				return true;
			}else{
				return super.setTagValueAndIsValid(value);
			}
		}

		public dealloc(){
			super.dealloc();
		}
	}
}

