@ECHO OFF
SET NODE_PATH=%APPDATA%\npm\node_modules
node -e "require('win-node-env')('%~n0')" X %*