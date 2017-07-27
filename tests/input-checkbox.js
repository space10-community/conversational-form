var checkboxInstance = window.cf.ConversationalForm.startTheConversation({
	"options": {
		
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

describe('Check input type=text', function() {
	it('Should be able to through all', function(done) {
		expect(checkboxInstance.tags).not.toBeNull();
		expect(checkboxInstance.tags.length).toBe(2);
		expect(checkboxInstance.tags[0].type).toBe("group");
		expect(checkboxInstance.tags[0].id).toBe("checkboxes");
		expect(checkboxInstance.tags[0].domElement).not.toBeNull();

		// could also tap into event system..
		// UserInputEvents.CONTROL_ELEMENTS_ADDED

		// test default values
		expect(checkboxInstance.tags[0].elements[0].domElement.checked).toBe(true);
		expect(checkboxInstance.tags[0].elements[1].domElement.checked).toBe(false);

		setTimeout(function(){
			// shift check values on check
			checkboxInstance.userInput.controlElements.elements[0].onClick();
			checkboxInstance.userInput.controlElements.elements[1].onClick();

			// submit values
			checkboxInstance.userInput.doSubmit();

			// check submitted values
			expect(checkboxInstance.tags[0].elements[0].domElement.checked).toBe(false);
			expect(checkboxInstance.tags[0].elements[1].domElement.checked).toBe(true);
			expect(checkboxInstance.getFormData(true)["checkbox-buttons-1"][0]).toBe("check-right");

			done();
		}, 500);
	});
});