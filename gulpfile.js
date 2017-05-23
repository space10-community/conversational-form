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
var rootPath = "./";

var srcFolder = rootPath + 'src/';
global.srcFolder = srcFolder;

var buildFolder = rootPath + 'build/';
global.buildFolder = buildFolder;

var distFolder = rootPath + 'dist/';
global.distFolder = distFolder;

var tasks = ['bower', 'scripts-docs-build', 'scripts-examples-build', 'scripts-form-build', 'styles-docs-build', 'styles-examples-build', 'styles-form-build', 'copy-images'];

// Watch Files For Changes
global.gulp.task('watch', tasks, function() {
	livereload.listen();

	console.log("Watch task started — development");

	global.gulp.watch(srcFolder + '/images/**/*', ['copy-images']);

	global.gulp.watch(srcFolder + '../docs/src/scripts/**/*.ts', ['typescript-docs']);
	global.gulp.watch(srcFolder + '../examples/src/scripts/**/*.ts', ['typescript-examples']);
	global.gulp.watch(srcFolder + '/scripts/**/*.ts', ['typescript-form']);

	global.gulp.watch(srcFolder + '../docs/src/styles/**/*.styl', ['stylus-docs']);
	global.gulp.watch(srcFolder + '../examples/src/styles/**/*.styl', ['stylus-examples']);
	global.gulp.watch(srcFolder + '/styles/**/*.styl', ['stylus-form']);
});

// Default tasks
global.gulp.task('default', ['watch']);
global.gulp.task('build', gulpsync.sync(tasks));
global.gulp.task('dist', gulpsync.sync(tasks));