describe('Check Conversational Form in global scope', function() {
	it('Should exist', function() {
		expect(window.cf.ConversationalForm).not.toBeNull();
	});
});

describe('Check Conversational Form reference', function() {
	it('Should exist', function() {
		var instance = window.cf.ConversationalForm.startTheConversation({
			formEl: document.createElement("form")
		});

		expect(instance).not.toBeNull();
	});
});