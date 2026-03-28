@echo off
echo [ron_GIT V1.0 - AUTO SYNC]
if not exist "input\PROMPT.txt" (echo [ERROR] PROMPT.txt not found! & pause & exit /b 1)
echo [1/4] Pushing PROMPT.txt... & git add input/PROMPT.txt & git commit -m "Prompt %DATE%" & git push origin main
if errorlevel 1 (echo [ERROR] Push failed! & pause & exit /b 1)
echo [2/4] Waiting for agent (max 5 min)... & timeout /t 300 /nobreak
echo [3/4] Pulling results... & git pull origin main
echo [4/4] Updating status... & echo Last Sync: %DATE% %TIME% >> status_monitor.txt
echo [DONE] Check output/ folder & dir output\ /O-D & pause
