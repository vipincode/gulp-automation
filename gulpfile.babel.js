const { src, dest, series, parallel, watch } = require("gulp");
const del = require('del');
const browserSync = require('browser-sync').create();
const concatenate = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const gulpCopy = require('gulp-copy');
const babel = require('gulp-babel');

const origin = 'src';
const destination = 'build';
sass.compiler = require('node-sass');

const sourceFiles = [
    `${origin}/img/**`,
    `${origin}/fonts/**`,
];

function copyFiles(cb) {
    src(sourceFiles)
   .pipe(gulpCopy(destination, { prefix: 1 }))
   cb();
}

async function clean(cb) {
    await del(destination);
    cb();
}

function html(cb) {
    src(`${origin}/**/*.html`).pipe(dest(destination));
    cb();
}

function css(cb) {
    src(`${origin}/scss/style.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass({
        outputStyle: 'compact'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(dest(`${destination}/css`))
    cb();
}

function js(cb) {
    src([ 
        `${origin}/js/lib/jquery.js`,
        `${origin}/js/main.js`,
    ]) 
    .pipe(concatenate('script.js'))
    .pipe(babel({
        presets: ['@babel/env']
     }))
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('./'))
    .pipe(dest(`${destination}/js`));

    cb();
}

function watcher(cb) {
    watch(`${origin}/**/*.html`).on('change', series(html, browserSync.reload))
    watch(`${origin}/**/*.scss`).on('change', series(css, browserSync.reload))
    watch(`${origin}/**/*.js`).on('change', series(js, browserSync.reload))

    cb();
}

function server(cb) {
    browserSync.init({
        notify: false,
        open: false,
        server: {
            baseDir: destination
        }
    })

    cb();
}

exports.default = series(clean, parallel(copyFiles, html, css, js), server, watcher);