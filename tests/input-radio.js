describe('Check input type=text', function() {
	var instance = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form")
		},
		"tags": [
			{
				"tag": "fieldset",
				"id": "radios",
				"cf-input-placeholder": "...",
				"cf-questions": "A radio for every navel for every taste",
				"children":[
					{
						"tag": "input",
						"type": "radio",
						"checked": "checked",
						"value":"radio-wrong",
						"name": "radio-buttons-1",
						"cf-label": "radio-1"
					},
					{
						"tag": "input",
						"type": "radio",
						"name": "radio-buttons-1",
						"value":"radio-right",
						"cf-label": "radio-2"
					}
				]
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
				"cf-questions": "dummy tag"
			}
		]
	});

	it('Should be able to through all', function(done) {
		expect(instance.tags).not.toBeNull();
		expect(instance.tags.length).toBe(3);
		expect(instance.tags[0].type).toBe("group");
		expect(instance.tags[0].domElement).not.toBeNull();

		// could also tap into event system..
		// UserInputEvents.CONTROL_ELEMENTS_ADDED

		// test default values
		expect(instance.tags[0].elements[0].domElement.checked).toBe(true);
		expect(instance.tags[0].elements[1].domElement.checked).toBe(false);

		setTimeout(function(){
			// shift check values on check
			instance.userInput.controlElements.elements[0].onClick();
			instance.userInput.controlElements.elements[1].onClick();

			// submit values
			// instance.userInput.doSubmit();

			// check submitted values
			expect(instance.tags[0].elements[0].domElement.checked).toBe(false);
			expect(instance.tags[0].elements[1].domElement.checked).toBe(true);

			expect(instance.getFormData(true)["radio-buttons-1"][0]).toBe("radio-right");

			done();
		}, 500);
	});
});