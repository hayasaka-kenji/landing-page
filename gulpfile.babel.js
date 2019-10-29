// Packages
import browserSync, {stream} from 'browser-sync'
import gulp from 'gulp'
import sass from 'gulp-sass'
import autoprefixer from 'autoprefixer'
import postcss from 'gulp-postcss'
import flexBugsFixes from 'postcss-flexbugs-fixes'
import ejs from 'gulp-ejs'
import notify from 'gulp-notify'
import plumber from 'gulp-plumber'
import rename from 'gulp-rename'
import babel from 'gulp-babel'
import imagemin from 'gulp-imagemin'
import pngquant from 'imagemin-pngquant'
import mozjpeg from 'imagemin-mozjpeg'

const config = {
  srcDir: './src/',
  destDir: './dist/'
}

const paths = {
  pages: {
    src: `${config.srcDir}pages/**/!(_)*.ejs`,
    dest: `${config.destDir}`
  },
  styles: {
    src: `${config.srcDir}styles/**/*.scss`,
    dest: `${config.destDir}css/`
  },
  scripts: {
    src: `${config.srcDir}scripts/*.js`,
    dest: `${config.destDir}js/`
  },
  images: {
    src: `${config.srcDir}images/*.{png,jpg,gif,svg}`,
    dest: `${config.destDir}img/`
  },
}

const options = {
  postcssProcessors: [
    autoprefixer({
      grid: true,
    }),
    flexBugsFixes
  ],
  imageminProcessors: [
    pngquant({quality: [.7, .85], speed: 1}),
    mozjpeg({ quality: 72 }),
    imagemin.svgo(),
    imagemin.gifsicle()
  ]
}

// Server
function server(done) {
  return browserSync.init({
    server: {
      baseDir: `${config.destDir}`
    }
  }, done)
}

// Pages 
function pages() {
  return gulp
    .src(paths.pages.src)
    .pipe(plumber({errorHandler: notify.onError('Pages Error: <%= error.message %>')}))
    .pipe(ejs())
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest(paths.pages.dest))
    .pipe(stream())
}

// Styles
function styles() {
  return gulp
    .src(paths.styles.src, { sourcemaps: true })
    .pipe(plumber({errorHandler: notify.onError('Styles Error: <%= error.message %>')}))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(postcss(options.postcssProcessors))
    .pipe(gulp.dest(paths.styles.dest, { sourcemaps: './' }))
    .pipe(stream())
}

// Scripts
function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(babel())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(stream())
}

// Images
function images() {
  return gulp
    .src(paths.images.src, {since: gulp.lastRun(images)})
    .pipe(imagemin(options.imageminProcessors))
    .pipe(gulp.dest(paths.images.dest))
}

// watchFiles
function watchFiles() {
  gulp.watch(paths.pages.src, gulp.series(pages))
  gulp.watch(paths.styles.src, gulp.series(styles))
  gulp.watch(paths.scripts.src, gulp.series(scripts))
}

// Default
gulp.task('default',gulp.series(
  gulp.parallel(pages, styles, scripts, images),
  gulp.series(server, watchFiles),
))