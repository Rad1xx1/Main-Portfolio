Set shell = CreateObject("WScript.Shell")
Set fs = CreateObject("Scripting.FileSystemObject")
folder = fs.GetParentFolderName(WScript.ScriptFullName)
shell.Run """C:\Program Files\nodejs\node.exe"" """ & folder & "\keep-alive.cjs""", 0, False
