/// <reference path="Button.ts"/>
/// <reference path="../../logic/Helpers.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class UploadFileUI extends Button {
		constructor(options: IControlElementOptions){
			super(options);

			if(Helpers.caniuse.fileReader()){
				this.referenceTag.domElement.addEventListener("change", (event: any) => {
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
						this.onChoose();
					}

					reader.readAsBinaryString(event.target.files[0]);
				}, false);
			}
		}

		protected onClick(event: MouseEvent){
			// super.onClick(event);
		}

		public triggerFileSelect(){
			// trigger file prompt
			this.referenceTag.domElement.click();
		}

		// override

		public dealloc(){
			// TODO: remove listeners on this.referenceTag.domElement
			super.dealloc();
		}

		public getTemplate () : string {
			const isChecked: boolean = this.referenceTag.value == "1" || this.referenceTag.domElement.hasAttribute("checked");
			return `<cf-radio-button class="cf-button" checked=`+(isChecked ? "checked" : "")+`>
				<cf-radio></cf-radio>
				` + this.referenceTag.title + `
			</cf-radio-button>
			`;
		}
	}
}