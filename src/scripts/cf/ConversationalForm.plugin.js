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
}));

// requirejs/amd plugin
(function (root, factory) {
	// from http://ifandelse.com/its-not-hard-making-your-library-support-amd-and-commonjs/#update
	if(typeof define === "function" && define.amd) {
		define(["conversational-form"], function(conversationalform){
			return (root.conversationalform = factory(conversationalform));
		});
	} else if(typeof module === "object" && module.exports) {
		module.exports = (root.conversationalform = factory(require("conversational-form")));
	} else {
		root.conversationalform = factory(cf.ConversationalForm);
	}
	}(window, function(conversationalform) {
		// module code here....
		return cf;
	}
));