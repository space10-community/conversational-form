var flatten = require('gulp-flatten');
var changed = require('gulp-changed');
// var gutil = require('gulp-util');
var log = require('fancy-log');
var livereload = require('gulp-livereload');
// var notify = require("gulp-notify");
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

function swallowError(error) {
	// If you want details of the error in the console
	log.error(error.toString());
	this.emit('end');
}

/**
 * OBS: seperate build tasks out so we can split the project into smaller pieces later.
 */

/**
 * form style tasks
 */

global.gulp.task('sass-form-build', ['sass-form'], function(){
	var src = [
		global.buildFolder + "conversational-form*.css"
	]

	var stream = global.gulp.src(src)
		// .pipe(concat('conversational-form.css'))
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
		global.srcFolder + "/styles/conversational-form*.scss"
	]
	var dst = global.buildFolder;

	var stream = global.gulp.src(src)
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({ browsers: ['> 1%']}))
		.pipe(global.gulp.dest(dst))
		.pipe(livereload())
		// .pipe(notify("CSS compiled."));

	return stream;
});







