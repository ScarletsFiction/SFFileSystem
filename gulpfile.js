var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var csso = require('gulp-csso');
var uglify = require('gulp-uglify-es').default;
var autoprefixer = require('gulp-autoprefixer');
var header = require('gulp-header');
var babel = require('gulp-babel');

gulp.task('js', function(){
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('sffilesystem.min.js'))
    .pipe(babel({
      "presets": [
        [
          "@babel/preset-env",
          {
            "targets": {
              "ie": "9"
            },
            "loose":true,
            "modules": false
          }
        ]
      ]
    }))
    .on('error', swallowError)
    .pipe(uglify())
    .on('error', swallowError)
    .pipe(header(`/*
  SFFileSystem
  A library for accessing local file system for
  the current website on the browser

  https://github.com/ScarletsFiction/SFFileSystem
*/\n`))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*.js'], ['js']);
});

gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: 'example'
    }
  });

  gulp.watch(['*.html', 'scripts/**/*.js'], {cwd: 'example'}, reload);
});

gulp.task('css', function () {
  return gulp.src('src/**/*.css')
    .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe(csso())
    .pipe(gulp.dest('./dist/css'))
});

gulp.task('default', ['js']);

function swallowError(error){
  console.log(error.message)
  this.emit('end')
}