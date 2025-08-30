@echo off
echo 🚀 MCP v2 Infrastructure Setup - Running as Administrator
echo.
echo This will install Docker Desktop and Maven to complete MCP v2 validation
echo.
pause

PowerShell -Command "Start-Process PowerShell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0setup-mcp-infrastructure.ps1\"' -Verb RunAs"
