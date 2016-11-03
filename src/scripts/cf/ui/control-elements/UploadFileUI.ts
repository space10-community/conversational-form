/// <reference path="Button.ts"/>
/// <reference path="../../logic/Helpers.ts"/>

// namespace
namespace cf {
	// interface

	// class
	export class UploadFileUI extends Button {
		private maxFileSize: number = 100000000000;
		private onDomElementChangeCallback: () => void;
		constructor(options: IControlElementOptions){
			super(options);

			if(Helpers.caniuse.fileReader()){
				const maxFileSizeStr: string = this.referenceTag.domElement.getAttribute("cf-max-size") || this.referenceTag.domElement.getAttribute("max-size");
				if(maxFileSizeStr){
					const maxFileSize: number = parseInt(maxFileSizeStr, 10);
					this.maxFileSize = maxFileSize;
				}

				this.onDomElementChangeCallback = this.onDomElementChange.bind(this);
				this.referenceTag.domElement.addEventListener("change", this.onDomElementChangeCallback, false);
			}else{
				// TODO: What to do when fileReader is not supported?
			}
		}

		private onDomElementChange(event: any){
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

				// check for file size
				const fileSize: number = (<HTMLInputElement> this.referenceTag.domElement).files[0].size;
				if(fileSize > this.maxFileSize){
					reader.abort();
					const dto: FlowDTO = {
						errorText: Dictionary.get("input-placeholder-file-size-error")
					};

					ConversationalForm.illustrateFlow(this, "dispatch", FlowEvents.USER_INPUT_INVALID, dto)
					document.dispatchEvent(new CustomEvent(FlowEvents.USER_INPUT_INVALID, {
						detail: dto
					}));

				}

				// var fileSize = fileInput.get(0).files[0].size; // in bytes
				// if(fileSize>maxSize){
				// 	alert('file size is more then' + maxSize + ' bytes');
				// 	return false;
				// }else{
				// 	alert('file size is correct- '+fileSize+' bytes');
				// }
			}
			reader.onload = (event: any) => {
				// console.log("onload", event);
				this.onChoose(); // submit the file
			}

			reader.readAsBinaryString(event.target.files[0]);
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
			if(this.onDomElementChangeCallback){
				this.referenceTag.domElement.removeEventListener("change", this.onDomElementChangeCallback, false);
				this.onDomElementChangeCallback = null;
			}

			super.dealloc();
		}

		public getTemplate () : string {
			const isChecked: boolean = this.referenceTag.value == "1" || this.referenceTag.domElement.hasAttribute("checked");
			return `<cf-upload-file-ui>
				` + this.referenceTag.title + `
			</cf-upload-file-ui>
			`;
		}
	}
}