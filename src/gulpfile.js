var del = require('del');
var gulp = require('gulp');
var ts = require('gulp-typescript');
var path = require('path');

var tsProject = ts.createProject('tsconfig.json');
var outputFolder = 'output/'
var tamaracBSOutputFolder = path.join(outputFolder, 'TamaracBuildSynchronizer');
var nodeModulesOutputFolder = path.join(tamaracBSOutputFolder, 'node_modules');
var taskResources = [
    './TamaracBuildSynchronizer/task.json',
    './TamaracBuildSynchronizer/icon.png'
];

gulp.task('clean', function () {
    return del('output/**', { force: true });
});

gulp.task('build', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(tamaracBSOutputFolder));
});

gulp.task('package', function (done) {
    gulp.src(taskResources)
        .pipe(gulp.dest(tamaracBSOutputFolder));
    gulp.src('./node_modules/**/*')
        .pipe(gulp.dest(nodeModulesOutputFolder));
    done();
});

gulp.task('rebuild', gulp.series('clean','build','package'))