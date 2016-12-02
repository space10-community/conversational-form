# Conversational Form

**Turning web forms into conversations.** Conversational Form is an open-source concept by <a href="https://www.space10.io">SPACE10</a> to easily turn any form element on a web page into a conversational form interface. It features conversational replacement of all input elements, reusable variables from previous questions and complete customization and control over the styling.

<a href="https://medium.com/conversational-interfaces/introducing-the-conversational-form-c3166eb2ee2f#.yq5axcfcq" target="_blank">Learn why we did it</a>

<a href="https://space10-community.github.io/conversational-form/" target="_blank" rel="Quick demo">![Quick demo](https://raw.githubusercontent.com/space10-community/conversational-form/master/docs/readme-cf.gif)</a>

Below you will find guides to inlcude the ConversationalForm into a page containing a form or <a href="https://space10-community.github.io/conversational-form/" target="_blank" rel="Quick demo">try a quick demo</a>


# Getting started

Include ConversationalForm in your page

```html
<script type="text/javascript" src="https://rawgit.com/space10-community/conversational-form/master/dist/conversational-form.min.js" crossorigin></script>
```

ConversationalForm will automatically look through the DOM for a form element with the attibute `cf-form-element`, and auto-instantiate.
```html
<form id="my-form-element" cf-form-element ...>
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
<form id="my-form-element" cf-form-element cf-prevent-autofocus>
```

## Customization

For more control over the output exclude the attribute `cf-form-element` from the form element and instantiate either with vanilla JS or jQuery:

### Self-instantiate with vanilla JS

```javascript
new cf.ConversationalForm({
	formEl: <HTMLFormElement>,
	// dictionaryData?: {}, // empty will throw error, see Dictionaty.ts for values
	// dictionaryAI?: {}, // empty will throw error, see Dictionaty.ts for values
	// context?: // context of where to append the ConversationalForm (see also cf-context attribute)
	// tags?: tags, // pass in custom tags (when prevent the auto-instantiation of ConversationalForm)
	// submitCallback?: () => void | HTMLButtonElement // custom submit callback if button[type=submit] || form.submit() is not wanted..
	// userImage: "..." //base64 || image url
});
```


### Instantiate with jQuery

```javascript
$("form").conversationalForm();
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
* two parameters is passed to the method
	* value: String, the value of the input field
	* tag: ITag, the actual DOM tag
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

using this reference you are able to remove the ConversationalForm by calling:

```javascript
window.ConversationalForm.remove();
```

# Overwrite styles
You can overwrite the UI with your own styles. Please see the source styles/css files for more info. 


# Contribute to ConversationalForm

We welcome contributions in the form of bug reports, pull requests, or thoughtful discussions in the [GitHub issue tracker](https://github.com/space10-community/conversational-form/issues).

ConversationalForm is a concept by [SPACE10](https://www.space10.io/). Brought to life by [Felix Nielsen](http://twitter.com/flexmotion), [RWATGG](http://rwatgg.com). Designed by [Charlie Isslander](https://twitter.com/charlieissland).

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


### install new packages for dev

	$ cd gulp-tasks
	$ npm install --save-dev XX


## Tests
When you are up and running, you can find a few form tests in the /test folder.

## Browser support
Tested in latest Chrome, Firefox, Safari and Internet Explorer.

# Websites that use Conversational Form

If you have a project that uses Conversational Form, feel free to make a PR to add it to this list:

- http://www.be-the-first-one-here.com
