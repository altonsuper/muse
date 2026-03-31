@echo off
title HQ Control Panel
setlocal enabledelayedexpansion

call :ensureGit
if errorlevel 1 (
  echo.
  echo [ERROR] Git repository or origin remote is not configured.
  pause
  exit /b 1
)

:menu
cls
echo ===========================================
echo            HQ CONTROL PANEL
echo ===========================================
echo 1. New Prompt (Opens Notepad for large text)
echo 2. Continue Iteration (Max 3 times rule)
echo 3. Clean Memory (Reset agent state and outputs)
echo 4. Status
echo 5. Exit
echo ==========================================
set /p choice="Select action (1-5): "

if "%choice%"=="1" goto new_prompt
if "%choice%"=="2" goto iterate
if "%choice%"=="3" goto clean_memory
if "%choice%"=="4" goto status
if "%choice%"=="5" exit
goto menu

:new_prompt
echo.
echo Opening Notepad... Please paste your prompt into input\PROMPT.txt, save, and close Notepad.
if not exist input\PROMPT.txt type nul > input\PROMPT.txt
start /wait notepad input\PROMPT.txt
call :validatePrompt
if errorlevel 1 goto menu

echo.
echo Triggering the request...
if not exist input\PROMPT.txt (
  echo [ERROR] input\PROMPT.txt not found.
  pause
  goto menu
)

git diff --quiet -- input\PROMPT.txt
if %errorlevel% equ 0 (
  echo [ERROR] No changes detected in input\PROMPT.txt. Please edit the prompt before submitting.
  pause
  goto menu
)

git add input\PROMPT.txt
git commit -m "Triggering AI Run with new prompt" 2>nul
if errorlevel 1 (
  echo [ERROR] Git commit failed. Make sure the prompt file contains changes.
  pause
  goto menu
)

git push origin %CURRENT_BRANCH%
if errorlevel 1 (
  echo [ERROR] Git push failed. Check your network and credentials.
  pause
  goto menu
)

goto polling

:iterate
echo.
echo Triggering next iteration...
git commit --allow-empty -m "Iterate again" 2>nul
if errorlevel 1 (
  echo [ERROR] Empty commit failed. Check your git repository state.
  pause
  goto menu
)

git push origin %CURRENT_BRANCH%
if errorlevel 1 (
  echo [ERROR] Git push failed. Check your network and credentials.
  pause
  goto menu
)

goto polling

:clean_memory
echo.
echo WARNING: This will permanently reset local agent memory and delete generated outputs.
echo.
set /p confirmClean="Are you sure you want to continue? (Y/N): "
if /i not "%confirmClean%"=="Y" (
  echo.
  echo Clean memory canceled.
  pause
  goto menu
)

echo.
echo Cleaning local memory state and selected/output files...
if exist .iteration_state.json del /f /q .iteration_state.json
if exist .memory.json del /f /q .memory.json
if exist memory\history.json (
  echo [] > memory\history.json
) else (
  echo [] > memory\history.json
)
if exist output\* del /f /q output\* 2>nul
if exist selected\* del /f /q selected\* 2>nul
echo.
echo Clean memory complete. Local iteration state, history, output, and selected files are reset.
pause
goto menu

:polling
echo.
echo Waiting for cloud agent to finish...
echo Polling repository every 30 seconds. Please wait.
set POLL_COUNT=0
set MAX_POLLS=20
:poll_loop
timeout /t 30 /nobreak >nul
set /a POLL_COUNT+=1
set BEHIND=0
git fetch origin %CURRENT_BRANCH% >nul 2>&1
for /f "tokens=*" %%C in ('git rev-list --count HEAD..origin/%CURRENT_BRANCH% 2^>nul') do set BEHIND=%%C
if "%BEHIND%"=="0" (
    if %POLL_COUNT% geq %MAX_POLLS% (
        echo.
        echo [TIMEOUT] No remote update after %MAX_POLLS% checks (~%MAX_POLLS% minutes).
        echo Please check the GitHub Actions run for commit %CURRENT_BRANCH% or try again later.
        pause
        goto menu
    )
    echo [Still working...] Checking again in 30s. (%POLL_COUNT%/%MAX_POLLS%)
    goto poll_loop
)
echo.
echo Update found! Pulling the best to local...
git pull origin %CURRENT_BRANCH%
echo.
echo Done! The latest files are ready in the 'selected' folder.
pause
goto menu

:status
echo.
echo --- HQ STATUS ---
echo Branch: %CURRENT_BRANCH%
for /f "delims=" %%R in ('git config --get remote.origin.url 2^>nul') do echo Origin: %%R
if exist input\PROMPT.txt (
  echo Current prompt first line:
  for /f "usebackq delims=" %%P in ("input\PROMPT.txt") do (
    echo %%P
    goto afterPrompt
  )
) else (
  echo No prompt file found.
)
:afterPrompt
if exist .iteration_state.json (
  echo Iteration state:
  findstr /c:"\"iteration\"" /c:"\"bestScore\"" /c:"\"bestVersion\"" .iteration_state.json
) else (
  echo No iteration state file.
)
if exist output\* (
  echo Output files count:
  for /f "delims=" %%O in ('dir /b output 2^>nul ^| find /c /v ""') do echo %%O
) else (
  echo Output files count: 0
)
if exist selected\* (
  echo Selected files count:
  for /f "delims=" %%S in ('dir /b selected 2^>nul ^| find /c /v ""') do echo %%S
) else (
  echo Selected files count: 0
)
pause
goto menu

:validatePrompt
set "PROMPT_EMPTY=1"
for /f "usebackq delims=" %%A in ("input\PROMPT.txt") do (
  if not "%%A"=="" set "PROMPT_EMPTY=0"
)
if "%PROMPT_EMPTY%"=="1" (
  echo.
  echo [ERROR] input\PROMPT.txt is empty. Please add a prompt before submitting.
  pause
  exit /b 1
)
exit /b 0

:ensureGit
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 exit /b 1
git remote get-url origin >nul 2>&1
if errorlevel 1 exit /b 1
for /f "tokens=*" %%B in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%B
if not "%CURRENT_BRANCH%"=="main" (
  echo [WARNING] Current branch is "%CURRENT_BRANCH%". Recommended branch: main.
)
exit /b 0
