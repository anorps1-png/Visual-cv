@echo off
:: Se déplacer dans le dossier du projet
cd /d "C:\Users\USER\Desktop\JOB\visual-cv-cameroon"

:: Journaliser le début du démarrage
echo [%date% %time%] Tentative de démarrage du serveur Next.js... >> startup_log.log

:: Vérifier la présence de Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [%date% %time%] ERREUR : Node.js n'est pas installé ou n'est pas dans le PATH. >> startup_log.log
    exit /b 1
)

:: Lancer le serveur Next.js sur le port 3000 en mode développement
:: Le flux de sortie est redirigé dans startup_log.log pour diagnostic en cas de besoin
call npm run dev -- -p 3000 >> startup_log.log 2>&1
