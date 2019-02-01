'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const browserSync = require('browser-sync');
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const If = require('gulp-if');

// Choose mode
const argv = require('yargs').argv;
const devMode = argv.development;
const prodMode = argv.production;

gulp.task('pages', function() {
	return gulp.src('./src/*.pug')
		.pipe(pug())
		.pipe(gulp.dest('./build/'))
		.pipe(browserSync.reload({ stream : true}));
});

gulp.task('styles', function() {
	return gulp.src('./src/styles/**/*.scss')
		.pipe(If(devMode, sourcemaps.init()))
		.pipe(sass())
		.pipe(autoprefixer({
			browsers : ["last 15 version", "> 1%", "ie 8", "ie 7"],
			cascade : false
		}))
		.pipe(If(prodMode, cssnano()))
		.pipe(If(devMode, sourcemaps.write()))
		.pipe(gulp.dest('./build/assets/css/'))
		.pipe(browserSync.reload({ stream : true}));
});

gulp.task('images', function() {
	return gulp.src('./src/images/**/*')
		.pipe(gulp.dest('./build/assets/images/'))
		.pipe(browserSync.reload({ stream : true}));
});

gulp.task('fonts', function() {
	return gulp.src('./src/fonts/**/*')
		.pipe(gulp.dest('./build/assets/fonts/'))
		.pipe(browserSync.reload({ stream : true}));
});

gulp.task('scripts', function() {
	return gulp.src('./src/scripts/**/*.js')
		.pipe(named(function() {
			return 'vendor';
		}))
		.pipe(webpack({
			mode : devMode ? 'development' : 'production',
			watch : false,
			module: {
				rules: [
					{
						test: /\.js$/,
						exclude: /node_modules/,
						use: {
							loader: "babel-loader",
							options: {
								"presets": ["@babel/preset-env"]
							}
						}
					}
				]
			}
		}))
		.pipe(If(prodMode, uglify()))
		.pipe(gulp.dest('./build/assets/scripts/'))
		.pipe(browserSync.reload({ stream : true}));
});

gulp.task('clean', function() {
	return del('build');
});

gulp.task('watch', function() {
	gulp.watch('./src/**/*.pug', gulp.series('pages'));
	gulp.watch('./src/scripts/**/*.js', gulp.series('scripts'));
	gulp.watch('./src/styles/**/*.scss', gulp.series('styles'));
	gulp.watch('./src/images/**/*', gulp.series('images'));
	gulp.watch('./src/fonts/**/*', gulp.series('fonts'));
});

gulp.task('server', function() {
    browserSync({
        server: {
            baseDir: "./build"
        }
    });
});

gulp.task('build', gulp.series('clean', 'pages', 'styles', 'images', 'fonts', 'scripts'));

gulp.task('default', devMode ? gulp.series('build', gulp.parallel('watch', 'server')) : gulp.series('build'));
