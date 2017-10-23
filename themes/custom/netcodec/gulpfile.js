/**
 * Configuration based on https://github.com/kurtisdunn/Drupal-8-Starter-Gulp-SASS
 */

'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require("gulp-concat");
var scsslint = require('gulp-scss-lint');
var sourcemaps = require("gulp-sourcemaps");
var plumber = require('gulp-plumber');
var gulpFilter = require('gulp-filter');
var importer = require('node-sass-globbing');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// Error notifications
var reportError = function (error) {
  $.notify({
    title: 'Gulp Task Error',
    message: 'Check the console.'
  }).write(error);
  console.log(error.toString());
  this.emit('end');
};

// Sass processing
gulp.task('sass', function () {
  // Avoids review of libraries code.
  const scssFilter = gulpFilter(['**', '!*/_src/scss/libraries/**/*.scss'], {restore: true});

  return gulp.src('./_src/scss/**/*.scss')
    .pipe(plumber())
    .pipe(scssFilter)
    // Check SCSS code.
    .pipe(scsslint({
      'reporterOutput': 'scssReport.json'
    }))
    .pipe(scssFilter.restore)
    .pipe($.sourcemaps.init())
    // Allows you to use glob syntax in imports (i.e. @import "dir/*.sass").
    // Use as a custom importer for node-sass.
    .pipe(sass({
      importer: importer
    }).on('error', sass.logError))
    // Convert sass into css
    .pipe($.sass({
      outputStyle: 'nested', // libsass doesn't support expanded yet
      precision: 10
    }))
    // Show errors
    .on('error', reportError)
    // Autoprefix properties
    .pipe($.autoprefixer())
    // Write sourcemaps
    .pipe($.sourcemaps.write())
    // Save css
    .pipe(gulp.dest('css'))
    // Notify when compilation finishes.
    .pipe($.notify({
      title: "SASS Compiled",
      message: "Your CSS files are ready!",
      onLast: true
    }));
});

// process JS files and return the concat file.
gulp.task("js", function () {
  return gulp.src("./_src/js/**/*.js")
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe(sourcemaps.init())
    .pipe(concat("script.js"))
    .pipe($.beautify({indentSize: 2}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("js"))
    .pipe($.notify({
      title: "JS Compile",
      message: "Your JS files are ready!",
      onLast: true
    }));
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src('./_src/imgs/**/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{
        cleanupIDs: false
      }]
    }))
    .pipe(gulp.dest('images'))
    .pipe($.notify({
      title: "Image",
      message: "Image processed successfully!",
      onLast: true
    }));
});

// Compress JS
gulp.task('compress', function () {
  return gulp.src('js/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.uglify())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('scripts'))
    .pipe($.notify({
      title: "JS Minified",
      message: "JS files in the theme have been minified.",
      onLast: true
    }));
});

// Run drush to clear all.
gulp.task('drush-all', function () {
  return gulp.src('', {
    read: false
  })
    .pipe($.shell([
      'drush cr',
      // 'drush cc theme-registry'
    ]))
    .pipe($.notify({
      title: "Caches cleared",
      message: "Drupal caches cleared.",
      onLast: true
    }));
});

// BrowserSync
gulp.task('browser-sync', function () {
  //watch files
  var files = [
    'styles/main.css',
    'js/**/*.js',
    'images/**/*',
    'templates/**/*.twig'
  ];
  browserSync.init({
    proxy: "netcodeblab.dev",
    online: true
  });
  //initialize browsersync

});

// Default task to be run with `gulp`
// gulp.task('default', ['sass', 'browser-sync', 'js', 'drush'], function() {
gulp.task('default', ['sass', 'js', 'images'], function () {
  gulp.watch("./_src/scss/**/*.scss", ['sass']);
  gulp.watch("./_src/js/**/*.js", ['js']);
  gulp.watch("./_src/imgs/**/*.js", ['images']);
  gulp.watch("templates/**/*.twig", ['drush-all']);
  gulp.watch("**/*.yml", ['drush-all']);
  gulp.watch("**/*.theme", ['drush-all']);
  gulp.watch("src/*.php", ['drush-all']);
});