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

global.gulp.task('typescript', function() {
	var src = [
		global.srcFolder + "/scripts/**/*.ts",
		"!" + global.srcFolder + "/scripts/typings/**/*.d.ts"
		];
	var dst = global.buildFolder;

	var stream = global.gulp.src(src)
		// .pipe(flatten()) // flatten folder structure
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

global.gulp.task('scripts', function() {
	var src = [
		global.srcFolder + "/scripts/**/*.js",
		"!" + global.srcFolder + "/scripts/typings/**/*.ts"
	];
	var dst = global.buildFolder;

	var stream = global.gulp.src(src)
		// .pipe(flatten()) // flatten folder structure
		.on('error', swallowError)
		.pipe(global.gulp.dest(dst))
		.pipe(livereload())
		.pipe(notify("Scripts compiled."));

	return stream
});

global.gulp.task('scripts-build', ['typescript', 'scripts'], function(){
	var src = [
		global.buildFolder + "scripts/bower_components/promise-polyfill/promise.js",
		global.buildFolder + "scripts/bower_components/custom-event-polyfill/custom-event-polyfill.js",
		global.buildFolder + "cf/**/*.js",
		"!" + global.buildFolder + "**/conversational-form.js",
		"!" + global.buildFolder + "**/conversational-form.min.js",
	];

	var dst = global.buildFolder;
	var stream = global.gulp.src(src)
		.pipe(concat('conversational-form.js'))
		.pipe(global.gulp.dest(dst))
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(global.gulp.dest(dst));
	
	return stream;
});