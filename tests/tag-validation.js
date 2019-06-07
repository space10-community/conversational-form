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
				"maxlength": 15,
			}
		]
	});

	var instanceMinMaxValue = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form"),
			"submitCallback": function(){

			}
		},
		"tags": [
			{
				"tag": "input",
				"type": "number",
				"name": "max-min-value",
				"min": 4,
				"max": 6,
				"required": true
			},
		]
	});

	var instanceMinValue = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form"),
			"submitCallback": function(){

			}
		},
		"tags": [
			{
				"tag": "input",
				"type": "number",
				"name": "max-min-value",
				"min": 4,
				"required": true
			},
		]
	});

	var instanceMaxValue = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form"),
			"submitCallback": function(){

			}
		},
		"tags": [
			{
				"tag": "input",
				"type": "number",
				"name": "max-min-value",
				"max": 4,
				"required": true
			},
		]
	});

	var instancePhone = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form"),
			"submitCallback": function(){

			}
		},
		"tags": [
			{
				"tag": "input",
				"type": "tel",
				"name": "telWithPattern",
				"pattern": "[0-9]{3}-[0-9]{3}-[0-9]{4}",
				"required": true
			},
		]
	});

	var instanceEmail = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form"),
			"submitCallback": function(){

			}
		},
		"tags": [
			{
				"tag": "input",
				"type": "email",
				"name": "email",
			},
		]
	});

	var instanceEmailRequired = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form"),
			"submitCallback": function(){

			}
		},
		"tags": [
			{
				"tag": "input",
				"type": "email",
				"name": "email",
				"required": true,
			},
		]
	});

	var instanceEmailWithCustomPattern = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form"),
			"submitCallback": function(){

			}
		},
		"tags": [
			{
				"tag": "input",
				"type": "email",
				"name": "email",
				"pattern": "[0-9]{3}-[0-9]{3}-[0-9]{4}",
			},
		]
	});
	
	var instanceTextRequired = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form"),
			"submitCallback": function(){

			}
		},
		"tags": [
			{
				"tag": "input",
				"type": "text",
				"name": "firstname",
				"required": true,
			},
		]
	});

	it('max+min-length test', function(done) {
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

	it('min + max value test', function(done) {
		// under min
		var isValid = instanceMinMaxValue.tags[0].setTagValueAndIsValid({text: "1"});
		expect(isValid).toBe(false);

		// over max
		var isValid = instanceMinMaxValue.tags[0].setTagValueAndIsValid({text: "10000"});
		expect(isValid).toBe(false);

		var isValid = instanceMinMaxValue.tags[0].setTagValueAndIsValid({text: "5"});
		expect(isValid).toBe(true);

		done();
	});

	it('min value test', function(done) {
		// under min
		var isValid = instanceMinValue.tags[0].setTagValueAndIsValid({text: "1"});
		expect(isValid).toBe(false);

		// == min
		var isValid = instanceMinValue.tags[0].setTagValueAndIsValid({text: "4"});
		expect(isValid).toBe(true);

		var isValid = instanceMinValue.tags[0].setTagValueAndIsValid({text: "100"});
		expect(isValid).toBe(true);

		done();
	});

	it('max value test', function(done) {
		// over max
		var isValid = instanceMaxValue.tags[0].setTagValueAndIsValid({text: "5"});
		expect(isValid).toBe(false);

		// == max
		var isValid = instanceMaxValue.tags[0].setTagValueAndIsValid({text: "4"});
		expect(isValid).toBe(true);

		// < max
		var isValid = instanceMaxValue.tags[0].setTagValueAndIsValid({text: "2"});
		expect(isValid).toBe(true);

		done();
	});

	it('tel with pattern', function(done) {
		var isValid = instancePhone.tags[0].setTagValueAndIsValid({text: "123123"});
		expect(isValid).toBe(false);

		var isValid = instancePhone.tags[0].setTagValueAndIsValid({text: "123 123 1234"});
		expect(isValid).toBe(false);
		
		var isValid = instancePhone.tags[0].setTagValueAndIsValid({text: "123 123 123"});
		expect(isValid).toBe(false);
		
		var isValid = instancePhone.tags[0].setTagValueAndIsValid({text: "123 123 1234"});
		expect(isValid).toBe(false);
		
		var isValid = instancePhone.tags[0].setTagValueAndIsValid({text: "123-123-1234"});
		expect(isValid).toBe(true);

		done();
	});
	
	it('email', function(done) {
		var isValid = instanceEmail.tags[0].setTagValueAndIsValid({text: "inputting something but regrets"});
		expect(isValid).toBe(false);

		var isValid = instanceEmail.tags[0].setTagValueAndIsValid({text: ""});
		expect(isValid).toBe(true);

		var isValid = instanceEmail.tags[0].setTagValueAndIsValid({text: "jens"});
		expect(isValid).toBe(false);
		
		var isValid = instanceEmail.tags[0].setTagValueAndIsValid({text: "jens@"});
		expect(isValid).toBe(false);
		
		var isValid = instanceEmail.tags[0].setTagValueAndIsValid({text: "jens@jenssogaard"});
		expect(isValid).toBe(false);
		
		var isValid = instanceEmail.tags[0].setTagValueAndIsValid({text: "jens@jenssogaard.x"});
		expect(isValid).toBe(false);

		var isValid = instanceEmail.tags[0].setTagValueAndIsValid({text: "jens@jenssogaard.com"});
		expect(isValid).toBe(true);

		done();
	});

	it('email required', function(done) {
		var isValid = instanceEmailRequired.tags[0].setTagValueAndIsValid({text: ""});
		expect(isValid).toBe(false);
		
		var isValid = instanceEmailRequired.tags[0].setTagValueAndIsValid({text: "jens"});
		expect(isValid).toBe(false);
		
		var isValid = instanceEmailRequired.tags[0].setTagValueAndIsValid({text: "jens@"});
		expect(isValid).toBe(false);
		
		var isValid = instanceEmailRequired.tags[0].setTagValueAndIsValid({text: "jens@jenssogaard"});
		expect(isValid).toBe(false);
		
		var isValid = instanceEmailRequired.tags[0].setTagValueAndIsValid({text: "jens@jenssogaard.x"});
		expect(isValid).toBe(false);

		var isValid = instanceEmailRequired.tags[0].setTagValueAndIsValid({text: "jens@jenssogaard.com"});
		expect(isValid).toBe(true);

		done();
	});
	
	it('email with custom pattern', function(done) {
		var isValid = instanceEmailWithCustomPattern.tags[0].setTagValueAndIsValid({text: "jens"});
		expect(isValid).toBe(false);
		
		var isValid = instanceEmailWithCustomPattern.tags[0].setTagValueAndIsValid({text: "jens@"});
		expect(isValid).toBe(false);
		
		var isValid = instanceEmailWithCustomPattern.tags[0].setTagValueAndIsValid({text: "jens@jenssogaard"});
		expect(isValid).toBe(false);
		
		var isValid = instanceEmailWithCustomPattern.tags[0].setTagValueAndIsValid({text: "jens@jenssogaard.x"});
		expect(isValid).toBe(false);

		var isValid = instanceEmailWithCustomPattern.tags[0].setTagValueAndIsValid({text: "123-456-7890"});
		expect(isValid).toBe(true);

		done();
	});
	
	it('text required', function(done) {
		var isValid = instanceTextRequired.tags[0].setTagValueAndIsValid({text: ""});
		expect(isValid).toBe(false);
	
		var isValid = instanceTextRequired.tags[0].setTagValueAndIsValid({text: "Jens"});
		expect(isValid).toBe(true);

		done();
	});
});