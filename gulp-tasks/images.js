var gulp = require('gulp');
var changed = require('gulp-changed');
var livereload = require('gulp-livereload');
var notify = require("gulp-notify");

gulp.task('copy-images', function() {
	var src = global.srcFolder+"/images/**/*";
	var dst = global.buildFolder;

	var stream = gulp.src(src)
		.pipe(gulp.dest(dst))
		.pipe(changed(dst))
		.pipe(livereload())
		.pipe(notify("Files copied."));

	return stream;
});