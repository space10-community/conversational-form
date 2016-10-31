// jqery plugin
// plugin'enabled

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module depending on jQuery.
		define(['jquery'], factory);
	} else {
		// No AMD. Register plugin with global jQuery object.
		factory(jQuery);
	}
	}(function ($) {

		$.fn.ConversationalForm = function(options) {
		//this = form element..
		new cf.ConversationalForm(options)
	};
}));