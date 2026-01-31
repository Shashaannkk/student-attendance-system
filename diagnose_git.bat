@echo off
echo --- GIT STATUS --- > git_diag.txt
git status >> git_diag.txt 2>&1
echo. >> git_diag.txt
echo --- GIT REMOTE --- >> git_diag.txt
git remote -v >> git_diag.txt 2>&1
echo. >> git_diag.txt
echo --- DONE --- >> git_diag.txt
