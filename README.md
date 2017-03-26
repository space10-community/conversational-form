# Conversational Form
[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://github.com/space10-community/conversational-form/blob/master/LICENSE.md)
[![npm version](https://img.shields.io/npm/v/conversational-form.svg)](https://www.npmjs.com/package/conversational-form)

**Turning web forms into conversations.** Conversational Form is an open-source concept by <a href="https://www.space10.io">SPACE10</a> to easily turn any form element on a web page into a conversational form interface. It features conversational replacement of all input elements, reusable variables from previous questions and complete customization and control over the styling.

<a href="https://medium.com/conversational-interfaces/introducing-the-conversational-form-c3166eb2ee2f#.yq5axcfcq" target="_blank">Learn why we did it</a>

<a href="https://space10-community.github.io/conversational-form/" target="_blank" rel="Quick demo">![Quick demo](https://raw.githubusercontent.com/space10-community/conversational-form/master/docs/images/readme-cf.gif)</a>

Below you will find guides to inlcude the ConversationalForm into a page containing a form or <a href="https://space10-community.github.io/conversational-form/" target="_blank" rel="Quick demo">try a quick demo</a>


# Getting started

Include ConversationalForm in your page

```html
<script type="text/javascript" src="https://conversational-form-092-0iznjsw.stackpathdns.com/conversational-form.min.js" crossorigin></script>
```

ConversationalForm will automatically look through the DOM for a form element with the attibute `cf-form`, and auto-instantiate.
```html
<form id="my-form-element" cf-form ...>
```

That's it! Your form is now conversational :thumbsup:  

## Optional attributes

**cf-context**  
If you want to have the ConversationalForm appended to a certain element (when auto-instantiating) then add attribute `cf-context` to an element, otherwise the ConversationalForm will be appended to the body element.
```html
<div cf-context ...>
```

**cf-prevent-autofocus**  
If you don't want to have the UserInput to auto focus.
```html
<form id="my-form-element" cf-form cf-prevent-autofocus>
```

**cf-no-animation**  
Add this to <form> tag to disable animations completly.

```html
<form id="my-form-element" cf-form cf-no-animation>
```

## Customization

For more control over the output exclude the attribute `cf-form` from the form element and instantiate either with vanilla JS or jQuery:

### Self-instantiate with vanilla JS

```javascript
new cf.ConversationalForm(<ConversationalFormOptions> {
	// HTMLFormElement
	formEl: HTMLFormElement;

	// context (HTMLElement) of where to append the ConversationalForm (see also cf-context attribute)
	context?: HTMLElement;

	// pass in custom tags (when prevent the auto-instantiation of ConversationalForm)
	tags?: Array<ITag>;

	// overwrite the default user Dictionary items
	dictionaryData?: Object;

	// overwrite the default robot Dictionary items
	dictionaryRobot?: Object;

	//base64 || image url // overwrite user image, without overwritting the user dictionary
	userImage?: string;

	// base64 || image url // overwrite robot image, without overwritting the robot dictionary
	robotImage?: string;

	// custom submit callback if button[type=submit] || form.submit() is not wanted..
	submitCallback?: () => void | HTMLButtonElement;

	// can be set to false to allow for loading and packaging of Conversational Form styles within a larger project.
	loadExternalStyleSheet?: boolean;

	// start the form in your own time, {cf-instance}.start(), exclude cf-form from form tag, see examples: manual-start.html
	preventAutoAppend?: boolean;

	// start the form in your own time, {cf-instance}.start(), exclude cf-form from form tag, see examples: manual-start.html
	preventAutoStart?: boolean;

	// optional horizontal scroll accerlation value, 0-1
	scrollAccerlation?: number;

	// allow for a global validation method, asyncronous, so a value can be validated through a server, call success || error
	flowStepCallback?: (dto: FlowDTO, success: () => void, error: () => void) => void;

	// optional event dispatcher, has to be an instance of cf.EventDispatcher
	eventDispatcher?: cf.EventDispatcher;
});
```


### Instantiate with jQuery

```javascript
$("form").conversationalForm(<ConversationalFormOptions> {
	...
});
```


## Parameters to pass the constructor of ConversationalForm: <<a name="ConversationalFormOptions"></a>ConversationalFormOptions>
* **formEl**: HTMLFormElement | string
* **context**?: HTMLElement | string
	* Set the context of where the ConversationalForm will be appended to
	* If not set then ConversationalForm will get appended to document.body
* **tags**?: Array<ITag>
	* [cf.Tag.createTag(element), ...]
* **dictionaryData**?: object
	* Possibility to overwrite the default [dictionary](https://github.com/space10-community/conversational-form/blob/master/src/scripts/cf/data/Dictionary.ts), empty will throw error, see [Dictionaty.ts](https://github.com/space10-community/conversational-form/blob/master/src/scripts/cf/data/Dictionary.ts) for values
* **dictionaryAI**?: object
	* Possibility to overwrite the default [dictionary](https://github.com/space10-community/conversational-form/blob/master/src/scripts/cf/data/Dictionary.ts), empty will throw error, see [Dictionaty.ts](https://github.com/space10-community/conversational-form/blob/master/src/scripts/cf/data/Dictionary.ts) for values
* **submitCallback**?: () => void | HTMLButtonElement
	* An alternative way to submit the form. Can be a Function or an HTMLButtonElement (click will be called). If not defined the component will search in the formEl after a button[type=”submit”] and call click() if not button is found final fallback will be to call submit() on formEl.
* **userImage**?: string
	* Set a different userImage. "..." //base64 || image url


## Map your own tags
The Conversational Form automatically detects the accepted tags in the passed in form element.
If this is not desired then you are able to define your own **tags**, and pass them into the constructor.:

```javascript
var fields = [].slice.call(formEl.querySelectorAll("input, select, button"), 0);
for (var i = 0; i < fields.length; i++) {
	var element = fields[i];
	tags.push(cf.Tag.createTag(element));
}
```

Tags can then be set in the instantiation object, see [ConversationalFormOptions](#ConversationalFormOptions)

# DOM Element attributes

#### input pattern="" attribute
**pattern** attribute will automatically be used if set in tag.:
```html
<input type="text" pattern="^hello" cf-questions="Your answer needs to include 'hello'" ..
```

### cf-questions
* to map questions directly to a tag.
* seperate by | to allow for more questions, app will shuffle.
```html
<input type="text" cf-questions="What is your name?|Please tell me your name." ..
```

### cf-input-placeholder
* tag specific, set the placeholder text on the UserInput field
```html
<input type="text" cf-input-placeholder="Should include http" ..
```

### {One way value-binding} with cf-questions:
For cui-questions, add {previous-answer} to insert the value from the previous user-answer.
```html
<input type="text" cf-questions="Hello {previous-answer}" ..
```
previous input could be firstname.

```html
<input type="text" cf-questions="So you want to travel to {previous-answer}" ..
```
previous input could be a select:option list with countries.

### cf-label
* set a label to the field, [type="radio"|"checkbox"]
```html
<input type="radio" cf-label="Subscribe to newsletter" ..
```

### cf-validation
* Javascript validate a <Tag> before submitting
* OBS. eval is used.
* Asyncronous, so a value can be validated through a server
* three parameters is passed to the method
	* dto: FlowDTO
	* success: () => void //callback
	* error: (optionalErrorMessage?: string) => void //callback
```html
<input type="text" cf-validation="window.validateFunction" ..
```

### cf-error
* to map error messages directly to a tag.
* seperate by | to allow for more error, app will shuffle.
```html
<input type="text" cf-error="Text is wrong wrong|Input is not right" ..
```


# Public API
When instantiating ConversationalForm a reference to the instance will be available in window scope.

```javascript
window.ConversationalForm
```

### focus
Sets focus on Conversational Form'
````javascript
window.ConversationalForm.focus();
````

### addRobotChatResponse
add a robot reponse, this you would usually do at the end of a process.

````javascript
window.ConversationalForm.addRobotChatResponse("You have reached the end of the form!");
````
See example of end-message [here](TBD....)
 
### addUserChatResponse
add a robot reponse, this you would usually do at the end of a process.

````javascript
window.ConversationalForm.addUserChatResponse("Hello from user.");
````
See example of end-message [here](TBD....)

### remove
remove the ConversationalForm by calling:

```javascript
window.ConversationalForm.remove();
```

### getFormData
get the FormData object of mapped form element, pass in true to get a serialized object back (JSON).

```javascript
window.ConversationalForm.getFormData(serialized: boolean);
```

### remapTagsAndStartFrom: 
remap registered tags and start flow from {index}
possible to ignore existing tags, to allow for the flow to just "happen"

```javascript
window.ConversationalForm.remapTagsAndStartFrom(index, setCurrentTagValue, ignoreExistingTags);
```

# Overwrite styles
You can overwrite the UI with your own styles. Please see the source styles/css files for more info. 


# Contribute to ConversationalForm

We welcome contributions in the form of bug reports, pull requests, or thoughtful discussions in the [GitHub issue tracker](https://github.com/space10-community/conversational-form/issues).

ConversationalForm is a concept by [SPACE10](https://www.space10.io/). Brought to life by [Felix Nielsen](http://twitter.com/flexmotion), [RWATGG](http://rwatgg.com). Designed by [Charlie Isslander](https://twitter.com/charlieissland).

## Get the source
### Bower

	$ bower install conversational-form --save

## Build the source

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

	# compiles (same as build) and watches files.
	$ gulp

#### sub tasks

	# compiles build files, to run locally.
	$ gulp build

	# compiles distribution files
	$ gulp dist

	# run docs
	$ gulp --docs

	# build docs
	$ gulp build --docs


### install new packages for dev

	$ cd gulp-tasks
	$ npm install --save-dev XX

### Version log
User previous versions. These versions are also available through bower, npm and Github tags

[v0.9.1](https://github.com/space10-community/conversational-form/tree/0.9.1)
```html
<!-- v0.9.1 -->
<script type="text/javascript" src="https://conversational-form-091-0iznjsw.stackpathdns.com/conversational-form.min.js" crossorigin></script>
```

[v0.9.0](https://github.com/space10-community/conversational-form/tree/0.9.0)
```html
<!-- v0.9.0 -->
<script type="text/javascript" src="https://conversational-form-0iznjsw.stackpathdns.com/conversational-form.min.js" crossorigin></script>
```

## Examples and tests
When you are up and running, you can find a few form tests and examples in the /examples folder.

## Browser support
Tested in latest Chrome, Firefox, Safari and Internet Explorer.

# Websites that use Conversational Form

If you have a project that uses Conversational Form, feel free to make a PR to add it to this list:

- ...
