# Script PowerShell pour configurer le lancement automatique

$WshShell = New-Object -ComObject WScript.Shell
$StartupFolder = $WshShell.SpecialFolders("Startup")
$ShortcutPath = Join-Path $StartupFolder "StartVisualCVCameroon.lnk"

# Emplacement du script VBS
$VbsPath = "C:\Users\USER\Desktop\JOB\visual-cv-cameroon\silent-start.vbs"
$WorkingDir = "C:\Users\USER\Desktop\JOB\visual-cv-cameroon"

Write-Host "Création du raccourci de démarrage automatique..."
Write-Host "Chemin de destination : $ShortcutPath"

# Création du raccourci Windows (.lnk)
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$VbsPath`""
$Shortcut.WorkingDirectory = $WorkingDir
$Shortcut.Description = "Lance le serveur Next.js pour visual-cv-cameroon de façon invisible au démarrage."
$Shortcut.Save()

Write-Host "Le raccourci de démarrage automatique a été créé avec succès !"
Write-Host "Le serveur démarrera automatiquement à chaque ouverture de session."
