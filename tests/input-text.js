describe('Check input type=text', function() {
	var instance = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form")
		},
		"tags": [
			{
				"tag": "input",
				"type": "text",
				"name": "first-tag",
				"id": "first-tag",
				"value": "test",
				"cf-questions": "Prefilled1&&with follow-up1&&with follow-up11||Prefilled2&&with follow-up2&&with follow-up22",
				"list": "browsers"
			},
			{
				"tag": "input",
				"type": "text",
				"name": "second-tag",
				"id": "second-tag",
				"cf-questions": "Prefilled1&&with follow-up1&&with follow-up11||Prefilled2&&with follow-up2&&with follow-up22"
			},
			{
				"tag": "input",
				"type": "text",
				"name": "third-tag",
				"id": "third-tag",
				"cf-questions": "dummy question"
			}
		]
	});

	it('Should be able to through all', function() {
		expect(instance.tags).not.toBeNull();
		expect(instance.tags.length).toBe(3);
		expect(instance.tags[0].id).toBe("first-tag");
		expect(instance.tags[0].domElement).not.toBeNull();

		expect(instance.tags[0].value).toBe("test");
		// add value and submit
		instance.userInput.inputElement.value = "Hello world";
		instance.userInput.doSubmit();

		// testing tag value
		expect(instance.tags[0].value).toBe("Hello world");
		
		// testing original tag (dom element) value
		expect(instance.tags[0].domElement.value).toBe("Hello world");

		// testing getFormData
		expect(instance.getFormData(true)["first-tag"]).toBe("Hello world");

		// input attribute list
		var hasListAttribute = instance.userInput.inputElement.hasAttribute('list');
		var listAttributeValue = instance.userInput.inputElement.getAttribute('list');
		expect(hasListAttribute).toBe(true);
		expect(listAttributeValue).toBe('browsers');
	});
});