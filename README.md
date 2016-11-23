# Conversational Form

![Quick demo](https://raw.githubusercontent.com/space10-community/conversational-form/master/docs/readme-cf.gif)


Below you will find guides to inlcude the ConversationalForm into a page containing a form.


## Include the ConversationalForm in your page
```html
<script type="text/javascript" id="conversational-form" src="https://cdn.rawgit.com/space10-community/conversational-form/master/dist/conversational-form.min.js" crossorigin></script>
```

ConversationalForm will automatically look through the DOM for a form element with the attibute **cf-form-element**, if found then it will auto-instantiate.
```html
<form id="my-form-element" cf-form-element ...>
```

You are now good to go :thumbsup:
  
  
---

## Customisation and how to extend the source

##### Self instantiate with vanilla JS
Exclude the attribute **cf-form-element** from the form element

```javascript
new cf.ConversationalForm({
	formEl: <HTMLFormElement>,
	// dictionaryData?: {}, // empty will throw error, see Dictionaty.ts for values
	// dictionaryAI?: {}, // empty will throw error, see Dictionaty.ts for values
	// context?: // context of where to append the ConversationalForm
	// tags?: tags, // pass in custom tags (when prevent the auto-instantiation of ConversationalForm)
	// submitCallback?: () => void | HTMLButtonElement // custom submit callback if button[type=submit] || form.submit() is not wanted..
	// userImage: "..." //base64 || image url
});
```


##### Use jQuery to instantiate.
Exclude the attribute **cf-form-element** from the form element

```javascript
$("form").conversationalform();
```


## Parameters to pass the constructor of ConversationalForm: <<a name="ConversationalFormOptions"></a>ConversationalFormOptions>
* **formEl**: HTMLFormElement | string
* **context**?: HTMLElement | string
	* Set the context of where the ConversationalForm will be appended to
	* If not set then ConversationalForm will get appended to document.body
* **tags**?: Array<ITag>
	* [cf.Tag.createTag(element), ...]
* **dictionaryData**?: object
	* Possibility to overwrite the default dictionary, empty will throw error, see Dictionaty.ts for values
* **dictionaryAI**?: object
	* Possibility to overwrite the default dictionary, empty will throw error, see Dictionaty.ts for values
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

## DOM Element attributes

#### input pattern="" attribute
**pattern** attribute will automatically be used if set in tag.:s
```html
<input type="text" pattern="^hello" cf-questions="Your answer needs to include 'hello'" ..
```

#### cf-questions
* to map questions directly to a tag.
* seperate by | to allow for more questions, app will shuffle.
```html
<input type="text" cf-questions="What is your name?|Please tell me your name." ..
```

#### {One way value-binding} with cf-questions:
For cui-questions, add {previous-answer} to insert the value from the previous user-answer.
```html
<input type="text" cf-questions="Hello {previous-answer}" ..
```
previous input could be firstname.

```html
<input type="text" cf-questions="So you want to travel to {previous-answer}" ..
```
previous input could be a select:option list with countries.

#### cf-label
* set a label to the field, [type="radio"|"checkbox"]
```html
<input type="radio" cf-label="Subscribe to newsletter" ..
```

#### cf-validation
* Javascript validate a <Tag> before submitting
* OBS. eval is used.
```html
<input type="text" cf-validation="window.validateFunction" ..
```

#### cf-error
* to map error messages directly to a tag.
* seperate by | to allow for more error, app will shuffle.
```html
<input type="text" cf-error="Text is wrong wrong|Input is not right" ..
```


### Public API
When instantiating ConversationalForm a reference to the instance will be available in window scope. 

```javascript
window.ConversationalForm
```

using this reference you are able to remove the ConversationalForm by calling:

```javascript
window.ConversationalForm.remove();
```

## Overwrite styles
You can overwrite the UI with your own styles. Please see the source styl/css files for more info. 
  
  
---
  
  
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
When you are up and running, you can find a few form tests in the /test folder.

#### Browser support
Tested in latest Chrome, Firefox, Safari and Internet Explorer.

#### License

The MIT License (MIT)

Copyright (c) 2013-2016 Petka Antonov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.