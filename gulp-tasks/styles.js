var rupture = require('rupture');
var nib = require('nib');
var stylus = require('gulp-stylus');
var flatten = require('gulp-flatten');
var changed = require('gulp-changed');
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var notify = require("gulp-notify");
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');

function swallowError(error) {
	// If you want details of the error in the console
	gutil.log(error.toString());
	gutil.beep();
	this.emit('end');
}

global.gulp.task('stylus', function() {
	var src = [
		global.srcFolder + "/styles/**/*.styl",
		"!" + global.srcFolder + "/styles/**/*-variables.styl"
	]
	var dst = global.buildFolder;

	var stream = global.gulp.src(src)
		// .pipe(flatten()) // flatten folder structure
		.pipe(changed(dst, {
			extension: '.css'
		}))
		.pipe(stylus({
			use: [nib(), rupture()],
			errors: true,
			compress: true
		}))
		.on('error', swallowError)
		.pipe(global.gulp.dest(dst))
		.pipe(livereload())
		.pipe(notify("Stylus compiled."));

	return stream;
});

global.gulp.task('styles-build', ['stylus'], function(){
	var src = [
		global.buildFolder + "**/*.css",
		"!" + global.buildFolder + "conversational-form.css",
		"!" + global.distFolder + "conversational-form.min.css",
	]

	var stream = global.gulp.src(src)
		.pipe(concat('conversational-form.css'))
		.pipe(global.gulp.dest(global.buildFolder))
		.pipe(cssmin())
		.pipe(rename({suffix: '.min'}))
		.pipe(global.gulp.dest(global.distFolder));
	
	return stream;
});