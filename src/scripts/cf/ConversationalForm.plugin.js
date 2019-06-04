// jquery plugin
(function (factory) {
	try{
		factory(jQuery);
	}catch(e){
		// whoops no jquery..
	}
}(function ($) {
	$.fn.conversationalForm = function (options /* ConversationalFormOptions, see README */) {
		options = options || {};
		if(!options.formEl){
			options.formEl = this[0];
		}

		if(!options.context){
			var formContexts = document.querySelectorAll("*[cf-context]");
			if(formContexts[0]){
				options.context = formContexts[0];
			}
		}

		return new cf.ConversationalForm(options);
	};
	
	$.fn.eventDispatcher = function () {
		return new cf.EventDispatcher();
	};

	$.fn.cf = cf;
}));

// requirejs/amd plugin
(function (root, factory) {
	// from http://ifandelse.com/its-not-hard-making-your-library-support-amd-and-commonjs/#update
	if(typeof define === "function" && define.amd) {
		define(["conversational-form"], function(cf){
			return (root.conversationalform = factory(cf));
		});
	} else {
		root.conversationalform = factory(cf);
	}
}(window, function(conversationalform) {
	return cf;
}));
