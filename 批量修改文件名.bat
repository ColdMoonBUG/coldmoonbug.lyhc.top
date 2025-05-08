@echo off
setlocal enabledelayedexpansion
set /a count=100
for %%f in (*.png) do (
  ren "%%f" "!count!%%~xf"
  set /a count+=1
)
echo 重命名完成！
pause
