var gulp = require('gulp');
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

gulp.task('stylus', function() {
	var src = global.srcFolder + "/styles/**/*.styl";
	var dst = global.buildFolder;

	var stream = gulp.src(src)
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
		.pipe(gulp.dest(dst))
		.pipe(livereload())
		.pipe(notify("Stylus compiled."));

	return stream;
});

gulp.task('styles-build', ['stylus'], function(){
	var src = [
		global.buildFolder + "**/*.css",
		"!" + global.buildFolder + "space10-cui-dist.css",
		"!" + global.buildFolder + "space10-cui-dist.min.css",
	]
	var dst = global.buildFolder;

	var stream = gulp.src(src)
		.pipe(concat('space10-cui-dist.css'))
		.pipe(gulp.dest(dst))
		.pipe(cssmin())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(dst));
	
	return stream;
});