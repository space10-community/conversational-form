var typescript = require('gulp-typescript');
var flatten = require('gulp-flatten');
var changed = require('gulp-changed');
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var notify = require("gulp-notify");
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

function swallowError(error) {
	// If you want details of the error in the console
	gutil.log(error.toString());
	gutil.beep();
	this.emit('end');
}


/**
 * form script tasks
 */
global.gulp.task('typescript-form', function() {
	var src = [
		global.srcFolder + "/scripts/**/*.ts",
		"!" + global.srcFolder + "/scripts/typings/**/*.d.ts"
		];
	var dst = global.buildFolder;

	var stream = global.gulp.src(src)
		.pipe(changed(dst,{
			extension: '.js'
		}))
		.pipe(typescript({
			noImplicitAny: true,
			target: "ES5",
			module: "none"//AMD... etc.
		}))
		.on('error', swallowError)
		.pipe(global.gulp.dest(dst))
		.pipe(livereload())
		.pipe(notify("Typescript compiled."));

	return stream
});

global.gulp.task('scripts-form', ['typescript-form'], function() {
	var src = [
		global.srcFolder + "/scripts/**/*.js"
	];
	var dst = global.buildFolder;

	var stream = global.gulp.src(src)
		.on('error', swallowError)
		.pipe(global.gulp.dest(dst))
		.pipe(livereload())
		.pipe(notify("Scripts compiled."));

	return stream
});

global.gulp.task('scripts-form-build', ['scripts-form'], function(){
	// build order is important in a inheritance world
	var src = [
		global.buildFolder + "bower_components/promise-polyfill/promise.js",
		global.buildFolder + "bower_components/custom-event-polyfill/custom-event-polyfill.js",

		global.buildFolder + "cf/ConversationalForm.plugin.js",
		global.buildFolder + "cf/logic/Helpers.js",
		global.buildFolder + "cf/logic/EventDispatcher.js",
		global.buildFolder + "cf/parsing/TagsParser.js",

		global.buildFolder + "cf/ui/BasicElement.js",
		global.buildFolder + "cf/ui/control-elements/ControlElement.js",
		global.buildFolder + "cf/ui/control-elements/ControlElements.js",
		global.buildFolder + "cf/ui/ScrollController.js",
		global.buildFolder + "cf/data/Dictionary.js",
		global.buildFolder + "cf/form-tags/Tag.js",
		global.buildFolder + "cf/form-tags/TagGroup.js",
		global.buildFolder + "cf/form-tags/InputTag.js",
		global.buildFolder + "cf/form-tags/SelectTag.js",
		global.buildFolder + "cf/form-tags/ButtonTag.js",
		global.buildFolder + "cf/form-tags/OptionTag.js",
		global.buildFolder + "cf/ui/control-elements/Button.js",
		global.buildFolder + "cf/ui/control-elements/RadioButton.js",
		global.buildFolder + "cf/ui/control-elements/CheckboxButton.js",
		global.buildFolder + "cf/ui/control-elements/OptionButton.js",
		global.buildFolder + "cf/ui/control-elements/OptionsList.js",
		global.buildFolder + "cf/ui/control-elements/UploadFileUI.js",
		global.buildFolder + "cf/ui/UserInput.js",
		global.buildFolder + "cf/ui/chat/ChatResponse.js",
		global.buildFolder + "cf/ui/chat/ChatList.js",
		global.buildFolder + "cf/logic/FlowManager.js",

		global.buildFolder + "cf/ConversationalForm.js"
	];

	var stream = global.gulp.src(src)
		.pipe(concat('conversational-form.js'))
		.pipe(global.gulp.dest(global.buildFolder))
		.pipe(global.gulp.dest(global.distFolder))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(global.gulp.dest(global.distFolder));

	return stream;
});


/**
 * docs script tasks
 */

global.gulp.task('typescript-docs', function() {
	var src = [
		global.srcFolder + "../docs/src/scripts/**/*.ts",
		"!" + global.srcFolder + "../docs/src/scripts/typings/**/*.d.ts"
		];
	var dst = global.buildFolder + "../docs/build";

	var stream = global.gulp.src(src)
		.pipe(changed(dst,{
			extension: '.js'
		}))
		.pipe(typescript({
			noImplicitAny: true,
			target: "ES5",
			module: "none"//AMD... etc.
		}))
		.on('error', swallowError)
		.pipe(global.gulp.dest(dst))
		.pipe(livereload())
		.pipe(notify("Typescript compiled."));

	return stream
});

global.gulp.task('scripts-docs-build', ['typescript-docs'], function(){
	// build order is important in a inheritance world
	var src = [
		global.buildFolder + "../docs/build/cf/**/*.js"
	];
	var dst = global.srcFolder + "../docs/build";

	var stream = global.gulp.src(src)
		.pipe(concat('conversational-form-docs.js'))
		.pipe(global.gulp.dest(dst))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(global.gulp.dest(dst));

	return stream;
});




/**
 * examples script tasks
 */

global.gulp.task('typescript-examples', function() {
	var src = [
		global.srcFolder + "../examples/src/scripts/**/*.ts",
		"!" + global.srcFolder + "../examples/src/scripts/typings/**/*.d.ts"
		];
	var dst = global.buildFolder + "../examples/build";

	var stream = global.gulp.src(src)
		.pipe(changed(dst,{
			extension: '.js'
		}))
		.pipe(typescript({
			noImplicitAny: true,
			target: "ES5",
			module: "none"//AMD... etc.
		}))
		.on('error', swallowError)
		.pipe(global.gulp.dest(dst))
		.pipe(livereload())
		.pipe(notify("Typescript compiled."));

	return stream
});

global.gulp.task('scripts-examples-build', ['typescript-examples'], function(){
	// build order is important in a inheritance world
	var src = [
		global.buildFolder + "../examples/build/cf/**/*.js"
	];
	var dst = global.srcFolder + "../examples/build";

	var stream = global.gulp.src(src)
		.pipe(concat('conversational-form-examples.js'))
		.pipe(global.gulp.dest(dst))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(global.gulp.dest(dst));

	return stream;
});