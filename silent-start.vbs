Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
Set objStartup = objWMIService.Get("Win32_ProcessStartup")
Set objConfig = objStartup.SpawnInstance_
objConfig.ShowWindow = 0
Set objProcess = objWMIService.Get("Win32_Process")
objProcess.Create "cmd.exe /c C:\Users\USER\Desktop\JOB\visual-cv-cameroon\start-server.bat", Null, objConfig, intProcessID
