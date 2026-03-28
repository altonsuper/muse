#!/bin/bash
echo "[ron_GIT V1.0 - AUTO SYNC]"
[ ! -f "input/PROMPT.txt" ] && echo "[ERROR] PROMPT.txt not found!" && exit 1
echo "[1/4] Pushing PROMPT.txt..." && git add input/PROMPT.txt && git commit -m "Prompt $(date)" && git push origin main
[ $? -ne 0 ] && echo "[ERROR] Push failed!" && exit 1
echo "[2/4] Waiting for agent (max 5 min)..." && sleep 300
echo "[3/4] Pulling results..." && git pull origin main
echo "[4/4] Updating status..." && echo "Last Sync: $(date)" >> status_monitor.txt
echo "[DONE] Check output/ folder" && ls -lt output/ | head -10
