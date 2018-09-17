describe('Test that rows attribute is set for textarea fields', function() {
	var html = " \
			<form id='markup-form'> \
				<textarea cf-label='Text label.' name='input-1' value='some text answer here' rows='4' /> \
				<input type='text' cf-label='name' name='input-2' /> \
				<input type='text' cf-label='name' name='input-3' /> \
				<input type='text' cf-label='name' name='input-4' /> \
				<input type='text' cf-label='name' name='input-5' /> \
			</form> \
	";

	var parser = new DOMParser()
	var doc = parser.parseFromString(html, "text/xml");

	document.body.appendChild(doc.getElementsByTagName("form")[0]);
	var formEl = document.getElementById("markup-form");

	var div = document.createElement("div");

	var instance = new window.cf.ConversationalForm.startTheConversation({
		formEl: formEl,
		context: div
	});

	it('Should set rows attribute to 4', function(done) {
		setTimeout(function() {
			expect(div.querySelector('textarea').getAttribute('rows')).toEqual('4');
      done();
    }, 2000);
	});

});
