var formless = {
	"options": {
		
	},
	"tags": [
		{
			"tag": "input",
			"type": "text",
			"id": "first-tag",
			"value": "Prefilled value here",
			"cf-questions": "Prefilled1&&with follow-up1&&with follow-up11||Prefilled2&&with follow-up2&&with follow-up22"
		}
	]
};

var instance = window.cf.ConversationalForm.startTheConversation(formless);

describe('Check input type text', function() {
	it('Should contain tag', function() {
		expect(instance.tags).not.toBeNull();
		expect(instance.tags[0].id).toBe("first-tag");
		expect(instance.tags[0].domElement).not.toBeNull();
	});
});