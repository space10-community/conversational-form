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

		public dealloc(){
			super.dealloc();
		}
	}
}

