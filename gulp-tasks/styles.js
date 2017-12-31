var flatten = require('gulp-flatten');
var changed = require('gulp-changed');
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var notify = require("gulp-notify");
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

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
			use: [nib()],
			errors: true
		}))
		.on('error', swallowError)
		.pipe(global.gulp.dest(dst))
		.pipe(livereload())
		.pipe(notify("Stylus compiled."));

	return stream;
});


global.gulp.task('sass-form-build', ['sass-form'], function(){
	var src = [
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
 * SCSS
 */
global.gulp.task('sass-form', function () {
	var src = [
		global.srcFolder + "/styles/**/*.scss",
		"!" + global.srcFolder + "styles/mixins/_cf-mixins.scss",
		"!" + global.srcFolder + "/styles/**/_*-variables.scss"
	]
	var dst = global.buildFolder;
	
	var stream = global.gulp.src(src)
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({ browsers: ['> 1%']}))
		.pipe(global.gulp.dest(dst))
		.pipe(livereload())
		.pipe(notify("CSS compiled."));

	return stream;
});







