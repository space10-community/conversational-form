describe('Test theme option', function() {
    var tags = [
        {
            "tag": "input",
            "type": "text",
            "name": "max-min-length",
            "minlength": 5,
            "maxlength": 15,
        }
    ];

	var instanceDefault = window.cf.ConversationalForm.startTheConversation({
		"options": {
            formEl: document.createElement("form"),
			"submitCallback": function(){}
		},
		"tags": tags
    });
    
	var instanceDark = window.cf.ConversationalForm.startTheConversation({
		"options": {
            theme: 'dark',
			formEl: document.createElement("form"),
			"submitCallback": function(){}
		},
		"tags": tags
	});
    
	var instanceGreen = window.cf.ConversationalForm.startTheConversation({
		"options": {
            theme: 'green',
			formEl: document.createElement("form"),
			"submitCallback": function(){}
		},
		"tags": tags
	});
    
    var instanceBlue = window.cf.ConversationalForm.startTheConversation({
		"options": {
            theme: 'blue',
			formEl: document.createElement("form"),
			"submitCallback": function(){}
		},
		"tags": tags
	});
    
    var instancePurple = window.cf.ConversationalForm.startTheConversation({
		"options": {
            theme: 'purple',
			formEl: document.createElement("form"),
			"submitCallback": function(){}
		},
		"tags": tags
	});
    
    var instanceRed = window.cf.ConversationalForm.startTheConversation({
		"options": {
            theme: 'red',
			formEl: document.createElement("form"),
			"submitCallback": function(){}
		},
		"tags": tags
	});
    
    var instanceWrongTheme = window.cf.ConversationalForm.startTheConversation({
		"options": {
            theme: 'some-non-existent-theme',
			formEl: document.createElement("form"),
			"submitCallback": function(){}
		},
		"tags": tags
	});

	it('Theme should be default (light)', function() {
		expect(instanceDefault.theme).toEqual('conversational-form.min.css');
	});
    
    it('Theme should be "dark"', function() {
		expect(instanceDark.theme).toEqual('conversational-form-dark.min.css');
	});
    
    it('Theme should be "green"', function() {
		expect(instanceGreen.theme).toEqual('conversational-form-green.min.css');
	});
    
    it('Theme should be "blue"', function() {
		expect(instanceBlue.theme).toEqual('conversational-form-irisblue.min.css');
	});
    
    it('Theme should be "purple"', function() {
		expect(instancePurple.theme).toEqual('conversational-form-purple.min.css');
	});
    
    it('Theme should be "red"', function() {
		expect(instanceRed.theme).toEqual('conversational-form-red.min.css');
	});
    
    it('Theme should be "default" because wrong option provided', function() {
		expect(instanceWrongTheme.theme).toEqual('conversational-form.min.css');
	});
    
    it('cdn path should not be relative', function() {
		expect(instanceDefault.cdnPath).toContain('https://cdn.jsdelivr.net/gh/space10-community/conversational-form');
	});
});
