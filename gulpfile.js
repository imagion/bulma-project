const { series, parallel, dest, src, watch, sourcemaps } = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const browsersync = require('browser-sync').create();
const cleancss = require('gulp-clean-css');
const concat = require('gulp-concat');
const cssnano = require('cssnano');
const del = require('del');
const gulpСssimport = require('gulp-cssimport');
// const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');
const postcssShort = require('postcss-short');
const rename = require('gulp-rename');
// const responsive = require('gulp-responsive');
const rsync = require('gulp-rsync');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify-es').default;

const reload = browsersync.reload;
const quality = 95; // Responsive images quality
// const imga = series('img_responsive_1x', 'img_responsive_2x')


const paths = {
		styles: {
			src: 'app/scss/*.scss',
			dist: 'app/css',
			build: 'app/css/styles.min.css'
		},
		scripts: {
			src: ['app/libs/jquery-3.3.1/dist/jquery.min.js',
			// 'app/libs/fontawesome-free-5.8.1-web/js/all.js',
			// 'app/libs/prognroll/prognroll.js',
			// 'app/libs/lazy.js/lazyload.js',
			'app/js/main.js'],
			watch: 'app/js/main.js',
			dist: 'app/js',
			build: 'app/js/scripts.min.js'
		},
		code: 'app/*.html'
};

function browserSync(cb) {
	browsersync.init({
		server: {
			baseDir: 'app'
		},
		open: false,
		notify: false,
		// online: false, // Work offline without internet connection
		// tunnel: true, tunnel: 'projectname', // Demonstration page: http://projectname.localtunnel.me
	});
	cb();
}

function css(cb) {
	return src(paths.styles.src, { sourcemaps: true })
	.pipe(plumber())
	.pipe(sass({ outputStyle: 'expand' }).on('error', sass.logError))
	.pipe(postcss([
		postcssPresetEnv(),
		postcssShort({ skip: 'x' }),
		// cssnano(),
	]))
	.pipe(gulpСssimport({matchPattern: "*.{css,sass,scss}", includePaths: ["../../libs/", "import"]}))
	.pipe(concat('styles.min.css'))
	.pipe(autoprefixer({
		grid: true,
		overrideBrowserslist: ['last 10 versions']
	}))
	// .pipe(rename({ basename: "styles", extname: '.min.css' }))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
	.pipe(dest(paths.styles.dist, { sourcemaps: '.' }))
	.pipe(dest(paths.site.css, { sourcemaps: '.' }))
	.pipe(reload({ stream: true }));
	cb();
}

function js(cb) {
	return src(paths.scripts.src, { sourcemaps: true })
	.pipe(plumber())
	.pipe(concat('scripts.min.js'))
	.pipe(uglify())
	.pipe(dest(paths.scripts.dist, { sourcemaps: '.' }))
	.pipe(dest(paths.site.js, { sourcemaps: '.' }))
	.pipe(reload({ stream: true }));
	cb();
}

function code(cb) {
	return src(paths.code)
	.pipe(reload({ stream: true }));
	cb();
}

// async function img_responsive_1x(cb) {
// 	return src('img/_src/thumbs/**/*.{png,jpg,jpeg,webp,raw}')
// 		.pipe(newer('img/thumbs/@1x'))
// 		.pipe(responsive({
// 			'**/*': { width: '50%', quality: quality }
// 		})).on('error', function (e) { console.log(e) })
// 		.pipe(rename(function (path) {path.extname = path.extname.replace('jpeg', 'jpg')}))
// 		.pipe(dest('img/thumbs/@1x'))
// 		cb();
// }
// async function img_responsive_2x(cb) {
// 	return src('img/_src/thumbs/**/*.{png,jpg,jpeg,webp,raw}')
// 		.pipe(newer('img/thumbs/@2x'))
// 		.pipe(responsive({
// 			'**/*': { width: '100%', quality: quality }
// 		})).on('error', function (e) { console.log(e) })
// 		.pipe(rename(function (path) {path.extname = path.extname.replace('jpeg', 'jpg')}))
// 		.pipe(dest('img/thumbs/@2x'))
// 		cb();
// }
// async function img_blog(cb) {
// 	return src('img/_src/blog/**/*.{png,jpg,jpeg,webp,raw}')
// 		.pipe(newer('img/blog'))
// 		.pipe(responsive({
// 			'**/*': { width: '100%', quality: quality }
// 		})).on('error', function (e) { console.log(e) })
// 		.pipe(rename(function (path) {path.extname = path.extname.replace('jpeg', 'jpg')}))
// 		.pipe(dest('img/blog'))
// 		cb();
// 		cb();
// }
// async function img(cb) {
// 	series(img_responsive_1x, img_responsive_2x, img_blog, reload)
// 	cb();
// }
//
// function cleanimg(cb) {
// 	return del(['app/img/@*'], { force: true })
// 	cb();
// }

function watcher(cb) {
	watch(paths.styles.src, parallel('css'))
	watch(paths.scripts.watch, parallel('js'))
	watch([paths.code, paths.site.code], parallel('code'))
	// watch('paths.img.src', parallel('img'))
	cb();
}

function deploy(cb) {
	return src('app/')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yoursite',
		destination: '',
		include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
	cb();
}

exports.css = css;
exports.js = js;
exports.code = code;
// exports.img_responsive_1x = img_responsive_1x;
// exports.img_responsive_2x = img_responsive_2x;
// exports.img_blog = img_blog;
// exports.img = series(img_responsive_1x, img_responsive_2x, img_blog);
// exports.cleanimg = cleanimg;
exports.deploy = deploy;

exports.default = parallel( css, js, browserSync, watcher );
