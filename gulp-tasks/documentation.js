var livereload = require('gulp-livereload');
var git = require('git-rev');
const sass        = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');


var lastCommit = "[LAST_COMMIT_HASH]";
var tagVersion = "[TAG_VERSION]";

git.long(function (str) {
  lastCommit = str;
});

git.tag(function (str) {
  tagVersion = str;
});

var nextVersion = "1.0.0";

gulp.task('documentation', function () {
    'use strict';
    var twig = require('gulp-twig');
    return gulp.src('./docs/' + nextVersion + '/src/pages/**/*.twig')
        .pipe(twig({
            // base: './/',
            data: {
                title: 'Conversational Form',
                tagVersion : tagVersion,
                nextVersion : nextVersion,
                lastCommit: lastCommit,
                versions: [
                    {
                        path: '1.0.0', 
                        label: "v1.0.0"
                    },
                    {
                        path: '0.9.90', 
                        label: "v0.9.90"
                    },
                    {
                        path: '0.9.80', 
                        label: "v0.9.80"
                    },
                    {
                        path: '0.9.71', 
                        label: "v0.9.71"
                    },
                    {
                        path: '0.9.70', 
                        label: "v0.9.70"
                    }
                ],
                pages: [
                    {
                        path: 'getting-started', 
                        label: "Getting Started"
                    },
                    {
                        path: 'options', 
                        label: "Options"
                    },
                    {
                        path: 'appearance', 
                        label: "Appearance"
                    },
                    {
                        path: 'functionality', 
                        label: "Functionality"
                    },
                    {
                        path: 'integration', 
                        label: "Integration"
                    },
                    {
                        path: 'examples', 
                        label: "Examples"
                    }
                ]
            }
        }))
        .pipe(gulp.dest('docs/' + nextVersion + '/'))
        .pipe(livereload());
});


var config = {
    bootstrapDir: 'gulp-tasks/node_modules/bootstrap/scss'
};
// Compile Sass & Inject Into Browser
gulp.task('documentationScss', function() {
    return gulp.src('./docs/' + nextVersion + '/src/scss/style.scss')
        .pipe(sass({
            includePaths: [config.bootstrapDir + ''],
        }))
        .pipe(autoprefixer({ browsers: ['> 1%']}))
        .pipe(gulp.dest('docs/' + nextVersion + '/css/'))
        .pipe(livereload());
});