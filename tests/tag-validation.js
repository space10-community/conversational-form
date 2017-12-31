describe('Validate tag attributes', function() {

	var instance = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form"),
			"submitCallback": function(){

			}
		},
		"tags": [
			{
				"tag": "input",
				"type": "text",
				"name": "max-min-length",
				"minlength": 5,
				"maxlength": 15
			}
		]
	});

	it('max+min-length test', function(done) {
		// add value and submit
		
		// under min
		var isValid = instance.tags[0].setTagValueAndIsValid({text: "0123"});
		expect(isValid).toBe(false);

		// over max
		var isValid = instance.tags[0].setTagValueAndIsValid({text: "0123456789123456789"});
		expect(isValid).toBe(false);

		//expect to fail

		var isValid = instance.tags[0].setTagValueAndIsValid({text: "0123456789"});
		expect(isValid).toBe(true);

		done();
	});
});