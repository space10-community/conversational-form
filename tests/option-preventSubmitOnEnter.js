describe('Validate tag attributes', function() {

	var preventSubmitOnEnterTestInstance = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form"),
			preventSubmitOnEnter: true,
		},
		"tags": [
			{
				"tag": "input",
				"type": "text",
				"name": "somefield32434"
			}
		]
	});

	it('max+min-length test', function(done) {
		expect(preventSubmitOnEnterTestInstance.preventSubmitOnEnter).toBe(true);
		done();
	});

	var preventSubmitOnEnterTestInstanceFalse = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form"),
			preventSubmitOnEnter: false,
		},
		"tags": [
			{
				"tag": "input",
				"type": "text",
				"name": "somefield32434234324"
			}
		]
	});

	it('max+min-length test', function(done) {
		expect(preventSubmitOnEnterTestInstanceFalse.preventSubmitOnEnter).toBe(false);
		done();
	});

	var preventSubmitOnEnterTestInstanceNotSet = window.cf.ConversationalForm.startTheConversation({
		"options": {
			formEl: document.createElement("form"),
		},
		"tags": [
			{
				"tag": "input",
				"type": "text",
				"name": "somefield123"
			}
		]
	});

	it('max+min-length test', function(done) {
		expect(preventSubmitOnEnterTestInstanceNotSet.preventSubmitOnEnter).not.toBe(true);
		done();
	});
});