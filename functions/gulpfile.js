const fs = require('fs');
const ts = require('@typescript-eslint/typescript-estree');
const gulp = require("gulp");
const shell = require('shelljs');

function getFileContentFromLastCommit(filePath) {
    // Retrieve file content from the last commit
    const lastCommitContent = shell.exec(`git show HEAD~1:${filePath}`, { silent: true }).stdout;
    return lastCommitContent;
}

function parseAST(code) {
    return ts.parse(code, { loc: true });
}

function checkFunctionChanges(filePath) {
    const currentContent = fs.readFileSync(filePath, 'utf-8');
    const lastCommitContent = getFileContentFromLastCommit(filePath);

    if (!lastCommitContent) {
        console.log("No previous version of the file found in the last commit.");
        return;
    }

    const currentAST = parseAST(currentContent);
    const previousAST = parseAST(lastCommitContent);

    console.log(currentAST, previousAST);
    // Implement your comparison logic here
    // For example, you could compare specific function nodes between currentAST and previousAST
    console.log("Comparison logic not implemented yet.");
}

gulp.task('watch', function () {
  gulp.watch('src/games/league-of-legends.ts').on('change', function(path, stats) {
    console.log(`File ${path} changed, checking for function updates...`);
    checkFunctionChanges(path);
  });
});
