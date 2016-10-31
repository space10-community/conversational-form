	      ___           ___           ___       ___           ___     
	     /\  \         /\  \         /\__\     /\  \         |\__\    
	    /::\  \       /::\  \       /:/  /    /::\  \        |:|  |   
	   /:/\:\  \     /:/\:\  \     /:/  /    /:/\:\  \       |:|  |   
	  /::\~\:\  \   /::\~\:\  \   /:/  /    /::\~\:\  \      |:|__|__ 
	 /:/\:\ \:\__\ /:/\:\ \:\__\ /:/__/    /:/\:\ \:\__\ ____/::::\__\
	 \/_|::\/:/  / \:\~\:\ \/__/ \:\  \    \/__\:\/:/  / \::::/~~/~   
	    |:|::/  /   \:\ \:\__\    \:\  \        \::/  /   ~~|:|~~|    
	    |:|\/__/     \:\ \/__/     \:\  \       /:/  /      |:|  |    
	    |:|  |        \:\__\        \:\__\     /:/  /       |:|  |    
	     \|__|         \/__/         \/__/     \/__/         \|__|    
	, we are the good guys


# SPACE10 Conversational User Interface

## Get started

### NPM
[Install](http://blog.npmjs.org/post/85484771375/how-to-install-npm)

	$ cd gulp-tasks
	$ npm install --save


### Gulp
[Install](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)



### bower
[Install](https://bower.io/#install-bower)



### tsd
[Install](https://github.com/DefinitelyTyped/tsd#install)

	$ cd src/scripts
	$ tsd install



### Gulp tasks
#### main task
watch task, watches .styl, .ts, .jpg, .png, .gif

	$ gulp

#### sub tasks

	$ gulp stylus
	$ gulp typescript
	$ gulp build


### install new packages for dev
	
	$ cd ./gulp-tasks
	$ npm install --save-dev XX


### Typescript + tsd
/src/scripts/tsd.json
ex.:
	
	$ tsd install XX --save --resolve


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

