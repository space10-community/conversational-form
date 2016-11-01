//var gulp = require('gulp');
var bower = require('gulp-bower');

global.gulp.task('bower', function() {
	return bower({
		cwd: "./"
	});
});