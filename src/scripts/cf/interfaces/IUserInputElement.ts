// namespace
namespace cf {
	// interface

	// general interface for all user inputs, like UserVoiceInput and UserTextInput (default)
	export interface IUserInputElement{
		dealloc():void;
		onFlowStopped():void;
		setFocusOnInput():void;
		reset():void;
		getFlowDTO():FlowDTO;
		visible:boolean;
		disabled:boolean;
		el: HTMLElement;
	}
}