(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module depending on jQuery.
		define(['jquery'], factory);
	} else {
		// No AMD. Register plugin with global jQuery object.
		try{
			factory(jQuery);
		}catch(e){
			// whoops no jquery..
		}
	}
	}(function ($) {
		$.fn.conversationalForm = function (options /* ConversationalFormOptions, see README */) {
			options = options || {};
			if(!options.formEl)
				options.formEl = this[0];
			return new cf.ConversationalForm(options);
		};
	}
));