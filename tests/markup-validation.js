describe('Validate form element scraping', function() {
	var html = " \
			<form id='markup-form'> \
				<!-- basic text input --> \
				<input type='text' cf-label='Text label.' name='input-1' value='ok' /> \
				\
				<!-- label for text input --> \
				<fieldset> \
					<label for='input-2'>What's your name?</label> \
					<input type='text' required='required' cf-questions='Hi there! What`s your name? 😊' name='input-2' id='input-2' /> \
				</fieldset> \
				\
				<!-- password --> \
				<input type='password' cf-label='Insert password' name='input-3' /> \
				\
				<!-- email --> \
				<input type='email' pattern='.+\@.+\..+' cf-label='Email w. regex' name='input-4' /> \
				\
				<!-- number --> \
				<input type='number' cf-label='Insert number' name='input-5' /> \
				\
				<!-- radio --> \
				<fieldset> \
					<input type='radio' cf-label='Radio' name='input-6' /> \
				</fieldset> \
				\
				<!-- checkbox --> \
				<fieldset> \
					<input type='checkbox' cf-label='Chekcbox' name='input-7' /> \
				</fieldset> \
			</form> \
	";

	var parser = new DOMParser()
	var doc = parser.parseFromString(html, "text/xml");

	document.body.appendChild(doc.getElementsByTagName("form")[0]);
	var formEl = document.getElementById("markup-form");

	var instance = new window.cf.ConversationalForm.startTheConversation({
		formEl: formEl,
		context: document.createElement("div")
	});

	it('Should be able to through all', function() {
		expect(instance.tags).not.toBeNull();
	});
});