describe('Check input type=text', function() {
	var instance = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form")
		},
		"tags": [
			{
				"tag": "fieldset",
				"id": "checkboxes",
				"cf-input-placeholder": "...",
				"cf-questions": "A checkbox for every taste",
				"children":[
					{
						"tag": "input",
						"type": "checkbox",
						"required": "required",
						"checked": "checked",
						"value":"check-wrong",
						"name": "checkbox-buttons-1",
						"cf-label": "checkbox-1"
					},
					{
						"tag": "input",
						"type": "checkbox",
						"required": "required",
						"name": "checkbox-buttons-1",
						"value":"check-right",
						"cf-label": "checkbox-2"
					},
					{
						"tag": "input",
						"type": "checkbox",
						"required": "required",
						"name": "checkbox-buttons-2",
						"value":"check-right",
						"cf-label": "checkbox-3"
					}
				]
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

	it('Should be able to through all', function(done) {
		expect(instance.tags).not.toBeNull();
		expect(instance.tags.length).toBe(3);
		expect(instance.tags[0].type).toBe("group");
		expect(instance.tags[0].id).toBe("checkboxes");
		expect(instance.tags[0].domElement).not.toBeNull();

		// could also tap into event system..
		// UserInputEvents.CONTROL_ELEMENTS_ADDED

		// test default values
		expect(instance.tags[0].elements[0].domElement.checked).toBe(true);
		expect(instance.tags[0].elements[1].domElement.checked).toBe(false);

		setTimeout(function(){
			// shift check values on$ check
			instance.userInput.controlElements.elements[0].onClick();
			instance.userInput.controlElements.elements[1].onClick();

			// submit values
			instance.userInput.doSubmit();

			// check submitted values
			expect(instance.tags[0].elements[0].domElement.checked).toBe(false);
			expect(instance.tags[0].elements[1].domElement.checked).toBe(true);
			expect(instance.getFormData(true)["checkbox-buttons-1"][0]).toBe("check-right");

			done();
		}, 500);
	});
});