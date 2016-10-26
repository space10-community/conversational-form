var gulp = require('gulp');
var typescript = require('gulp-typescript');
var flatten = require('gulp-flatten');
var changed = require('gulp-changed');
var gutil = require('gulp-util');
var livereload = require('gulp-livereload');
var notify = require("gulp-notify");
var concat = require('gulp-concat');
var jsmin = require('gulp-jsmin');
var rename = require('gulp-rename');

function swallowError(error) {
	// If you want details of the error in the console
	gutil.log(error.toString());
	gutil.beep();
	this.emit('end');
}

gulp.task('typescript', function() {
	var src = [
		global.srcFolder + "/scripts/**/*.ts",
		"!" + global.srcFolder + "/scripts/typings/**/*.d.ts"
		];
	var dst = global.buildFolder;

	var stream = gulp.src(src)
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
		.pipe(gulp.dest(dst))
		.pipe(livereload())
		.pipe(notify("Typescript compiled."));

	return stream
});

gulp.task('scripts', function() {
	var src = [
		global.srcFolder + "/scripts/**/*.js",
		"!" + global.srcFolder + "/scripts/typings/**/*.ts"
	];
	var dst = global.buildFolder;

	var stream = gulp.src(src)
		// .pipe(flatten()) // flatten folder structure
		.on('error', swallowError)
		.pipe(gulp.dest(dst))
		.pipe(livereload())
		.pipe(notify("Typescript compiled."));

	return stream
});

gulp.task('scripts-build', ['typescript', 'scripts'], function(){
	var src = [
		global.buildFolder + "**/*.js",
		"!" + global.buildFolder + "space10-cui-dist.js",
		"!" + global.buildFolder + "space10-cui-dist.min.js",
	]
	var dst = global.buildFolder;

	var stream = gulp.src(src)
		.pipe(concat('space10-cui-dist.js'))
		.pipe(gulp.dest(dst))
		.pipe(jsmin())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(dst));
	
	return stream;
});