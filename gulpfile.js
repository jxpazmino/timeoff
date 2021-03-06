'use strict';

var gulp 		 = require('gulp'),
	uglify 		 = require('gulp-uglify'),
	gulpif 		 = require('gulp-if'),
	htmlmin      = require('gulp-htmlmin'),
    concat       = require('gulp-concat'),
    uglifycss	 = require('gulp-uglifycss'),
    browserify	 = require('browserify'),
    source       = require('vinyl-source-stream'),
    buffer       = require('vinyl-buffer'),
    env,
    outputDir;
    
env = process.env.NODE_ENV || 'development';
//env = 'production';
if(env==='development') {
	outputDir = 'builds/development/';
} else {
	outputDir = 'builds/production/';
}
    
var jsSources  = 'components/scripts/**/*.js',
    cssSources = 'components/css/*.css';

gulp.task('js', function() {
	return gulp.src(jsSources)
	.pipe(concat('bundle.js'))
	.pipe(uglify())
	.pipe(gulp.dest(outputDir + 'js'));
});

gulp.task('css', function() {
	return gulp.src(cssSources)
	.pipe(uglifycss({
		"maxLineLen": 80,
        "uglyComments": true
	}))
	.pipe(concat('styles.css'))
	.pipe(gulp.dest(outputDir + 'css'));
});

gulp.task('html', function() {
	return gulp.src('builds/development/*.html') //always read index @dev
	.pipe(gulpif(env === 'production', htmlmin({collapseWhitespace: true})))
	.pipe(gulpif(env === 'production', gulp.dest(outputDir)));
});

gulp.task('views', function() {
	return gulp.src('builds/development/views/*.html')
	.pipe(gulpif(env === 'production', htmlmin({collapseWhitespace: true})))
	.pipe(gulpif(env === 'production', gulp.dest(outputDir + 'views')));
});

gulp.task('default', ['js', 'css', 'html']);
    