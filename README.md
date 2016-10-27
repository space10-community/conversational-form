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


# Tests...
sadsda

# Usage...
asdsada


# Conventions
Link to google doc?


# Usage


### CUI tag attributes


#### cue-questions
* to map questions directly to a tag.
* seperate by | to allow for more questions, app will shuffle.

	<input type="text" cue-questions="What is your name?|Please tell me your name." ..

#### cue-validation
* set validation callback, be aware that eval is used to make the method available.

	<input type="text" cue-validation="window.validateFunction" ..


Elements
form-tags/* : represent DOM (virtual) tags
ui/* : represent interface (views) tags, like the input field or cui radio buttons


Event flow
* FlowManager, connects flow and Tags
listens:
io.space10.InputEvents.UPDATE

validates and distributes
io.space10.InputEvents.USER_INPUT_UPDATE
io.space10.InputEvents.USER_INPUT_INVALID

