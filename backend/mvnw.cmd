@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "BASE_DIR=%~dp0")
@SET MAVEN_PROJECTBASEDIR=%BASE_DIR%

@IF NOT "%MAVEN_PROJECTBASEDIR:~-1%"=="\" (SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR%\")
@echo.
@echo Maven project base dir: %MAVEN_PROJECTBASEDIR%
@echo.

@SET MAVEN_WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
@SET MAVEN_WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties"

@SET DOWNLOAD_URL=

@FOR /F "usebackq tokens=1,2 delims==" %%A IN (%MAVEN_WRAPPER_PROPERTIES%) DO (
    @IF "%%A"=="distributionUrl" (SET "DISTRIBUTION_URL=%%B")
    @IF "%%A"=="wrapperUrl" (SET "DOWNLOAD_URL=%%B")
)

@SET MVN_CMD=mvn.cmd
@IF NOT "%JAVA_HOME%"=="" (
    @IF EXIST "%JAVA_HOME%\bin\mvn.cmd" (SET "MVN_CMD=%JAVA_HOME%\bin\mvn.cmd")
)

@FOR /F "tokens=*" %%i IN ('where mvn.cmd 2^>nul') DO (SET "MVN_CMD=%%i" & GOTO mvn_found)
:mvn_found

@IF EXIST "%MVN_CMD%" (
    @SET "MVNW_REPOURL=https://repo.maven.apache.org/maven2"
    @"%MVN_CMD%" -f "%MAVEN_PROJECTBASEDIR%pom.xml" %*
    @EXIT /B %ERRORLEVEL%
)

@ECHO Maven not found. Please install Java 17+ and Maven 3.8+, or ensure JAVA_HOME is set.
@EXIT /B 1
