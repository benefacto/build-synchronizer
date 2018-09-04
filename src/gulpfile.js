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

gulp.task('build', ['clean'], function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(tamaracBSOutputFolder));
});

gulp.task('package', ['build'], function (done) {
    gulp.src(taskResources)
        .pipe(gulp.dest(tamaracBSOutputFolder));
    gulp.src(['./node_modules/**/*', 
    // Excluding folders with # character because they will fail tfx part name validation
    '!**/#'])
        .pipe(gulp.dest(nodeModulesOutputFolder));
    done();
});