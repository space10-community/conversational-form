// namespace
namespace cf {
	// interface

	// general interface for user input, like the default UserTextInput
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