global.gulp = require('gulp');
var fs = require('fs');
var livereload = require('./gulp-tasks/node_modules/gulp-livereload');
var gulpsync = require('./gulp-tasks/node_modules/gulp-sync')(global.gulp);
var Server = require('karma').Server;

var package = JSON.parse(fs.readFileSync('gulp-tasks/package.json'));

// include task files
require("./gulp-tasks/styles");
require("./gulp-tasks/scripts");
require("./gulp-tasks/images");
require("./gulp-tasks/bower");
require("./gulp-tasks/documentation");

//options
var rootPath = "./";

var srcFolder = rootPath + 'src/';
global.srcFolder = srcFolder;

var buildFolder = rootPath + 'build/';
global.buildFolder = buildFolder;

var distFolder = rootPath + 'dist/';
global.distFolder = distFolder;

var tasks = ['bower', 'scripts-form-build', 'sass-form-build', 'copy-images'];
var distTasks = tasks.concat(['karma-tests']);

// Watch Files For Changes
global.gulp.task('watch', tasks, function() {
	livereload.listen();

	console.log("Watch task started — development");

	global.gulp.watch(srcFolder + '/images/**/*', ['copy-images']);

	global.gulp.watch(srcFolder + '/scripts/**/*.ts', ['typescript-form']);
	global.gulp.watch(srcFolder + '/scripts/cf/**/*.js', ['scripts-form-build']);
	
	global.gulp.watch(srcFolder + '/styles/**/*.scss', ['sass-form']);

	global.gulp.watch(srcFolder + '../docs/**/*.twig', ['documentation']);	
	global.gulp.watch(srcFolder + '../docs/**/*.scss', ['documentationScss']);
});

// Default tasks
global.gulp.task('default', ['watch']);
global.gulp.task('build', gulpsync.sync(tasks));
global.gulp.task('dist', gulpsync.sync(distTasks));

gulp.task('karma-tests', function (done) {
	new Server({
	  configFile: __dirname + '/karma.conf.js',
	  singleRun: true
	}, done).start();
  });
