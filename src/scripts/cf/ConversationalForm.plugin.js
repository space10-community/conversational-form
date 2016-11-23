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
		$.fn.conversationalForm = function () {
			return new cf.ConversationalForm({
				formEl: this[0],
				// dictionaryData?: {},// empty will throw error
				// dictionaryAI?: {},
				// context?: document.getElementsByClassName("form-outer")[0],
				// tags?: tags,
				// submitCallback?: () => void | HTMLButtonElement
				//base64 or crossdomain-enabled image url
				// userImage: "..."
			});
		};
	}
));