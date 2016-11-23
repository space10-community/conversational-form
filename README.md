# Conversational Form


#### Include the Conversational Form

	<script type="text/javascript" id="conversational-form" src="https://raw.githubusercontent.com/space10-community/conversational-form/master/dist/conversational-form.min.js" crossorigin></script>

#### Instantiate:

##### Automatic:
This will load in the code for the CF. From here you can instantiate it like:

Initially when loaded, CF will automatically look through the DOM for a form element with the attibute "cf-form-element", if found then it will auto-instantiate.
	
	<form id="co-billing-form" action="" cf-form-element>
	...


##### Manual
You can also self instantiate from vanilla JS.

	new cf.ConversationalForm({
		formEl: <HTMLFormElement>,
		// dictionaryData?: {},// empty will throw error
		// dictionaryAI?: {},
		// context?: document.getElementsByClassName("form-outer")[0],
		// tags?: tags,
		// submitCallback?: () => void | HTMLButtonElement
		
		//base64 or crossdomain-enabled image url
		// userImage: "..."
	});

##### Jquery

	$("form").conversationalform();


### ConversationalFormOptions
* formEl: HTMLFormElement | string
* context?: HTMLElement | string
	* Set the context of where the CF will be appended to
	* If not set then CF will get appended to document.body
* tags?: Array<ITag>
	* [cf.Tag.createTag(element), ...]
* dictionaryData?: object
	* Possibility to overwrite the default dictionary
* dictionaryAI?: object
	* Possibility to overwrite the default AI dictionary
submitCallback?: () => void | HTMLButtonElement
	* An alternative way to submit the form. Can be a Function or an HTMLButtonElement (click will be called). If not defined the component will search in the formEl after a button[type=”submit”] and call click() if not button is found final fallback will be to call submit() on formEl.


### Map your own tags
The Conversational Form automatically detects the accepted tags in the passed in form element.
If this is not desired then you are able to define your own **tags**, and pass them into the constructor.:

	var fields = [].slice.call(formEl.querySelectorAll("input, select, button"), 0);
	for (var i = 0; i < fields.length; i++) {
		var element = fields[i];
		tags.push(cf.Tag.createTag(element));
	}

Tags can then be set in the instantiation object, see ConversationalFormOptions


### Public API
When instantiating CF a reference to the instance will be available in window scope. 

	window.ConversationalForm

using this reference you are able to remove the CF by calling:

	window.ConversationalForm.remove();


## Overwrite styles
You can overwrite the UI with your own styles. Please see the source css for more info.




## Extend functionality -> Get started / build the source files

### NPM
[Install](http://blog.npmjs.org/post/85484771375/how-to-install-npm)

	$ cd gulp-tasks
	$ npm install


### Gulp
[Install](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)

Install local gulp from project root

	$ npm install gulp


### Typescript Typings
[Install](https://github.com/typings/typings)

	$ cd src/scripts
	$ typings install


### Gulp tasks
#### main task
watch task, watches .styl, .ts, .jpg, .png, .gif, compiles to /build

	$ gulp

#### sub tasks

	$ gulp stylus
	$ gulp typescript
	$ gulp build
	$ gulp dist


### install new packages for dev
	
	$ cd gulp-tasks
	$ npm install --save-dev XX


## Tests...
TBD ...

## Usage...
See /tests for various use-cases


## Conventions
Link to google doc?


## DOM Element attributes


#### cf-questions
* to map questions directly to a tag.
* seperate by | to allow for more questions, app will shuffle.

	<input type="text" cf-questions="What is your name?|Please tell me your name." ..

#### cf-validation
* set validation callback, be aware that eval is used to make the method available.

	<input type="text" cf-validation="window.validateFunction" ..

#### cf-error
* to map error messages directly to a tag.
* seperate by | to allow for more error, app will shuffle.

	<input type="text" cf-error="field is wrong wrong wrong" ..

#### Browser support
// TODO: insert browser support table.