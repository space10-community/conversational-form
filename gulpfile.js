global.gulp = require('gulp');
var fs = require('fs');
var livereload = require('./gulp-tasks/node_modules/gulp-livereload');
var gulpsync = require('./gulp-tasks/node_modules/gulp-sync')(global.gulp);

var package = JSON.parse(fs.readFileSync('gulp-tasks/package.json'));

// include task files
require("./gulp-tasks/styles");
require("./gulp-tasks/scripts");
require("./gulp-tasks/images");
require("./gulp-tasks/bower");

//options
var isDocs = process.argv.indexOf("--docs") != -1;
global.isDocs = isDocs;

var rootPath = isDocs ? "./docs/" : "./";

var srcFolder = rootPath + 'src/';
global.srcFolder = srcFolder;

var buildFolder = rootPath + 'build/';
global.buildFolder = buildFolder;

var distFolder = isDocs ? rootPath + 'build/' : rootPath + 'dist/';
global.distFolder = distFolder;

// Watch Files For Changes
global.gulp.task('watch', ['bower', 'typescript', 'scripts', 'stylus', 'copy-images'], function() {
	livereload.listen();

	console.log("Watch task started");

	global.gulp.watch(srcFolder + '/scripts/**/*.ts', ['typescript']);
	
	global.gulp.watch(srcFolder + '/scripts/**/*.js', ['scripts']);

	global.gulp.watch(srcFolder + '/images/**/*', ['copy-images']);

	if(isDocs){
		global.gulp.watch(srcFolder + '/styles/**/*.styl', ['stylus', 'styles-build']);
	}else{
		global.gulp.watch(srcFolder + '../examples/src/styles/**/*.styl', ['stylus-examples']);
		global.gulp.watch(srcFolder + '/styles/**/*.styl', ['stylus']);
	}
});

// Default tasks
global.gulp.task('default', ['watch']);
global.gulp.task('build', gulpsync.sync(['bower', 'scripts-build', 'styles-build', 'copy-images']));
global.gulp.task('dist', gulpsync.sync(['bower', 'scripts-build', 'styles-build', 'copy-images']));