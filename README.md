# Conversational Form


#### Include the Conversational Form

	<script type="text/javascript" id="cui" src=".../conversational-form.js" crossorigin></script>

#### Instantiate:

##### Automatic:
This will load in the code for the CF. From here you can instantiate it like:

Initially when loaded, CF will automatically look through the DOM for a form element with the attibute "cf-form-element", if found then it will instantiate it self.
	
	<form id="co-billing-form" action="" cf-form-element>
	...


##### Manual (exclude cf-form-element from markup):
You can also self instantiate:

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

or via jQuery

	$("form").ConversationalForm();


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

Tags can then be set in the instantiation object.


### Public API
When instantiating CF a reference to the instance will be set to 

	window.ConversationalForm

using this reference you are able to remove the CF by calling:

	window.ConversationalForm.remove();


## Overwrite styles
...




## Get started / build the source files

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
watch task, watches .styl, .ts, .jpg, .png, .gif

	$ gulp

#### sub tasks

	$ gulp stylus
	$ gulp typescript
	$ gulp build


### install new packages for dev
	
	$ cd gulp-tasks
	$ npm install --save-dev XX


## Tests...
TBD ...

## Usage...
TBD ...


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

## Classes
========

#### Dictionary
Reference to app labels and AI default responses. Everything can be overwritten.


#### FlowManager;
Controls the flow of the app, binds events from views together

#### form-tags/*:  
represent DOM (virtual) tags  

**Tag**  
**SelectTag**  
**InputTag**  
**ButtonTag**  
**TagGroup** (contains x number of the above)  

#### ui/*:
Represent app views, like the User Inputfield or CF radio buttons  

**UserInput**, handles user input and shows different kinds of interaction UI, like RadioButtons, SelectList etc.  
**ChatList,** handles ChatResponses  
**ChatResponse,** chat bubble

#### Events
##### UserInputEvents:
SUBMIT: when a value is submittet from the UserInput view
KEY_CHANGE: when a key is used, 

##### FlowEvents:
USER_INPUT_UPDATE: "cf-flow-user-input-update",
USER_INPUT_INVALID: "cf-flow-user-input-invalid",
FLOW_UPDATE: "cf-flow-update",


#### Browser support
// TODO: insert browser support table.