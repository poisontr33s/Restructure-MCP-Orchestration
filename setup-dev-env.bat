@echo off
echo ????? Captain Guthilda's Portable Java 21 Environment
echo.

REM Set portable JAVA_HOME and MAVEN_HOME
set "JAVA_HOME=%~dp0dev-tools\java21"
set "MAVEN_HOME=%~dp0dev-tools\maven"

REM Add to PATH (prepend to ensure our versions are used)
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"

echo ? Java Home: %JAVA_HOME%
echo ? Maven Home: %MAVEN_HOME%
echo ? Environment configured for portable development
echo.

REM Verify installation
echo ?? Verifying installation...
java -version
echo.
mvn -version
echo.

echo ?? Ready for Java 21 development!
echo ?? To use: Run this script before development sessions
cmd /k
