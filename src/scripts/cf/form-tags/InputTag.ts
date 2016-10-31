/// <reference path="Tag.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class InputTag extends Tag {
		constructor(options: ITagOptions){
			super(options);

			if(this.domElement.getAttribute("type") == "text"){

			}else if(this.domElement.getAttribute("type") == "email"){

			}else if(this.domElement.getAttribute("type") == "tel"){

			}else if(this.domElement.getAttribute("type") == "checkbox"){

			}else if(this.domElement.getAttribute("type") == "radio"){

			}else if(this.domElement.getAttribute("type") == "password"){

			}else if(this.domElement.getAttribute("type") == "file"){

			}
		}
	}
}

