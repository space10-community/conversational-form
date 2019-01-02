describe('Test progressbar', function() {
	var html = " \
			<form id='markup-form-progressbar'> \
				<input type='text' cf-label='name' name='name' /> \
				<input type='text' cf-label='city' name='city' /> \
				<input type='text' cf-label='icecream' name='icecream' /> \
				<input type='text' cf-label='car' name='car' /> \
			</form> \
	";

	var parser = new DOMParser()
	var doc = parser.parseFromString(html, "text/xml");

	document.body.appendChild(doc.getElementsByTagName("form")[0]);
	var formEl = document.getElementById("markup-form-progressbar");

	var div = document.createElement("div");

	var instance = new window.cf.ConversationalForm.startTheConversation({
		formEl: formEl,
		context: div,
		showProgressBar: true
	});

	it('ProgressBar should be visible and be at 50%', function(done) {
		instance.remapTagsAndStartFrom(2);
		setTimeout(function() {
			expect(div.querySelector('.cf-progressBar').classList).toContain('show');
			expect(div.querySelector('.cf-progressBar .bar').style.width).toEqual('50%');
      done();
    }, 4500);
	});

});
