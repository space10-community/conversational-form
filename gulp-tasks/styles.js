var rupture = require('rupture');
var nib = require('nib');
var stylus = require('gulp-stylus');
var flatten = require('gulp-flatten');
var changed = require('gulp-changed');
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var notify = require("gulp-notify");
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');

function swallowError(error) {
	// If you want details of the error in the console
	gutil.log(error.toString());
	gutil.beep();
	this.emit('end');
}

/**
 * OBS: seperate build tasks out so we can split the project into smaller pieces later.
 */

/**
 * form style tasks
 */
global.gulp.task('stylus-form', function() {
	var src = [
		global.srcFolder + "/styles/**/*.styl",
		global.srcFolder + "../examples/styles/**/*.styl",
		global.srcFolder + "../docs/styles/**/*.styl",
		"!" + global.srcFolder + "styles/mixins/_cf-mixins.styl",
		"!" + global.srcFolder + "/styles/**/_*-variables.styl"
	]
	var dst = global.buildFolder;

	var stream = global.gulp.src(src)
		// .pipe(flatten()) // flatten folder structure
		.pipe(changed(dst, {
			extension: '.css'
		}))
		.pipe(stylus({
			use: [nib(), rupture()],
			errors: true
		}))
		.on('error', swallowError)
		.pipe(global.gulp.dest(dst))
		.pipe(livereload())
		.pipe(notify("Stylus compiled."));

	return stream;
});

global.gulp.task('styles-form-build', ['stylus-form'], function(){
	var src = [
		global.buildFolder + "**/*.css",
		global.buildFolder + "cf/cf.css",
		global.buildFolder + "cf/ui/control-elements/cf-control-elements.css",
		global.buildFolder + "cf/ui/control-elements/cf-button.css",
		global.buildFolder + "cf/ui/control-elements/cf-radio-button.css",
		global.buildFolder + "cf/ui/control-elements/cf-checkbox-button.css",
		global.buildFolder + "cf/ui/control-elements/cf-options-list.css",
		global.buildFolder + "cf/ui/control-elements/cf-upload-file-ui.css",
		global.buildFolder + "cf/ui/cf-input.css",
		global.buildFolder + "cf/ui/cf-info.css",
		global.buildFolder + "cf/ui/cf-list-button.css",
		global.buildFolder + "cf/ui/chat/cf-chat-response.css",
		global.buildFolder + "cf/ui/chat/cf-chat.css",

		"!" + global.buildFolder + "conversational-form-docs.css",
		"!" + global.buildFolder + "conversational-form-docs.min.css",
		"!" + global.buildFolder + "conversational-form.css",
		"!" + global.distFolder + "conversational-form.min.css",
	]

	var stream = global.gulp.src(src)
		.pipe(concat('conversational-form.css'))
		.pipe(global.gulp.dest(global.distFolder))
		.pipe(cleanCSS())
		.pipe(rename({suffix: '.min'}))
		.pipe(global.gulp.dest(global.distFolder));
	
	return stream;
});



/**
 * /docs style tasks
 */
global.gulp.task('stylus-docs', function(){
	var src = [
		global.srcFolder + "../docs/src/**/*.styl",
		"!" + global.srcFolder + "../docs/src/**/_cf-docs-variables.styl",
	]
	var dst = global.srcFolder + "../docs/build";

	var stream = global.gulp.src(src)
		.pipe(changed(dst, {
			extension: '.css'
		}))
		.pipe(stylus({
			use: [nib(), rupture()],
			errors: true
		}))
		.pipe(global.gulp.dest(dst));
	
	return stream;
});

global.gulp.task('styles-docs-build', ['stylus-docs'], function(){
	var src = [
		global.srcFolder + "../docs/build/styles/**/*.css",
		global.srcFolder + "../docs/build/styles/cf/docs.css",
		global.srcFolder + "../docs/build/styles/cf/ui/cf-theming.css",
		global.srcFolder + "../docs/build/styles/cf/ui/section-cf-context.css",
		global.srcFolder + "../docs/build/styles/cf/ui/section-form.css",
		global.srcFolder + "../docs/build/styles/cf/ui/section-info.css",
		global.srcFolder + "../docs/build/styles/cf/ui/sticky-menu.css",
		global.srcFolder + "../docs/build/styles/cf/ui/switch.css",
		
		"!" + global.srcFolder + "../docs/build/**/cf-theming.css",
		"!" + global.srcFolder + "../docs/build/**/cf-docs-variables.css",
		"!" + global.srcFolder + "../docs/build/conversational-form-docs.css",
		"!" + global.srcFolder + "../docs/build/conversational-form-docs.min.css",
	]
	
	var dst = global.srcFolder + "../docs/build";

	var stream = global.gulp.src(src)
		.pipe(concat('conversational-form-docs.css'))
		.pipe(cleanCSS())
		.pipe(global.gulp.dest(dst))
		.pipe(rename({suffix: '.min'}))
		.pipe(global.gulp.dest(dst));
	
	return stream;
});

/**
 * /examples style tasks
 */
global.gulp.task('stylus-examples', function(){
	var src = [
		global.srcFolder + "../examples/src/**/*.styl"
	]
	var dst = global.srcFolder + "../examples/build";

	var stream = global.gulp.src(src)
		.pipe(changed(dst, {
			extension: '.css'
		}))
		.pipe(stylus({
			use: [nib(), rupture()],
			errors: true
		}))
		.pipe(global.gulp.dest(dst));
	
	return stream;
});

global.gulp.task('styles-examples-build', ['stylus-examples'], function(){
	var src = [
		global.srcFolder + "../examples/build/styles/**/*.css",

		"!" + global.srcFolder + "../examples/build/conversational-form-examples.css",
		"!" + global.srcFolder + "../examples/build/conversational-form-examples.min.css",
	]
	
	var dst = global.srcFolder + "../examples/build";

	var stream = global.gulp.src(src)
		.pipe(concat('conversational-form-examples.css'))
		.pipe(cleanCSS())
		.pipe(global.gulp.dest(dst))
		.pipe(rename({suffix: '.min'}))
		.pipe(global.gulp.dest(dst));
	
	return stream;
});