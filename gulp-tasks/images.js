var changed = require('gulp-changed');
var livereload = require('gulp-livereload');
// var notify = require("gulp-notify");

global.gulp.task('copy-images', function() {
	var src = global.srcFolder+"/images/**/*";
	var dst = global.buildFolder;

	var stream = global.gulp.src(src)
		.pipe(global.gulp.dest(dst))
		.pipe(changed(dst))
		.pipe(livereload())
		// .pipe(notify("Files copied."));

	return stream;
});