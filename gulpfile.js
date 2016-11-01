global.gulp = require('gulp');
var fs = require('fs');
var livereload = require('./gulp-tasks/node_modules/gulp-livereload');

var package = JSON.parse(fs.readFileSync('gulp-tasks/package.json'));

// include task files
require("./gulp-tasks/styles");
require("./gulp-tasks/scripts");
require("./gulp-tasks/images");
require("./gulp-tasks/bower");

//options
var srcFolder = './src/';
global.srcFolder = srcFolder;

var buildFolder = './build/';
global.buildFolder = buildFolder;

// Watch Files For Changes
global.gulp.task('watch', ['bower', 'typescript', 'stylus', 'copy-images'], function() {
	livereload.listen();

	console.log("Watch task started");

	global.gulp.watch(srcFolder + '/scripts/**/*.ts', ['typescript']);
	
	global.gulp.watch(srcFolder + '/scripts/**/*.js', ['scripts']);

	global.gulp.watch(srcFolder + '/images/**/*', ['copy-images']);

	global.gulp.watch(srcFolder + '/styles/**/*.styl', ['stylus']);
});

// Default Task
global.gulp.task('default', ['watch']);
global.gulp.task('build', ['bower', 'scripts-build', 'styles-build', 'copy-images']);