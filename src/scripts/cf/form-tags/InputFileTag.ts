/// <reference path="Tag.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class InputFileTag extends Tag {
		constructor(options: ITagOptions){
			super(options);

			if(Helpers.caniuse.fileReader()){
				this.domElement.addEventListener("change", (event: any) => {
					console.log((<any>this.constructor).name, '123:', event);

					var reader: FileReader = new FileReader();
					reader.onerror = (event: any) => {
						console.log("onerror", event);
					}
					reader.onprogress = (event: any) => {
						console.log("onprogress", event);
					}
					reader.onabort = (event: any) => {
						console.log("onabort", event);
					}
					reader.onloadstart = (event: any) => {
						console.log("onloadstart", event);
					}
					reader.onload = (event: any) => {
						console.log("onload", event);
					}

					reader.readAsBinaryString(event.target.files[0]);
				}, false);
			}
		}

		public triggerFileSelect(){
			this.domElement.click();
		}

		public dealloc(){
			// TODO: Unbind listeners to dom element!
			super.dealloc();
		}
	}
}

