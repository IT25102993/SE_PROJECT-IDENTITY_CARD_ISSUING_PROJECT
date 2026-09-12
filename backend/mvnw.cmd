@echo off
setlocal

set "MVN_CMD=C:\Users\%USERNAME%\.m2\wrapper\dists\apache-maven-3.9.9\apache-maven-3.9.9\bin\mvn.cmd"

if not exist "%MVN_CMD%" (
    echo Maven not found at %MVN_CMD%
    echo Falling back to PATH...
    set "MVN_CMD=mvn"
)

"%MVN_CMD%" %*
endlocal
