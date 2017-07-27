var textInstance = window.cf.ConversationalForm.startTheConversation({
	"options": {
		
	},
	"tags": [
		{
			"tag": "input",
			"type": "text",
			"name": "first-tag",
			"id": "first-tag",
			"value": "test",
			"cf-questions": "Prefilled1&&with follow-up1&&with follow-up11||Prefilled2&&with follow-up2&&with follow-up22"
		},
		{
			"tag": "input",
			"type": "text",
			"name": "second-tag",
			"id": "second-tag",
			"cf-questions": "Prefilled1&&with follow-up1&&with follow-up11||Prefilled2&&with follow-up2&&with follow-up22"
		}
	]
});

describe('Check input type=text', function() {
	it('Should be able to through all', function() {
		expect(textInstance.tags).not.toBeNull();
		expect(textInstance.tags.length).toBe(2);
		expect(textInstance.tags[0].id).toBe("first-tag");
		expect(textInstance.tags[0].domElement).not.toBeNull();

		expect(textInstance.tags[0].value).toBe("test");
		// add value and submit
		textInstance.userInput.inputElement.value = "Hello world";
		textInstance.userInput.doSubmit();

		// testing tag value
		expect(textInstance.tags[0].value).toBe("Hello world");
		
		// testing original tag (dom element) value
		expect(textInstance.tags[0].domElement.value).toBe("Hello world");

		// testing getFormData
		expect(textInstance.getFormData(true)["first-tag"]).toBe("Hello world");
	});
});