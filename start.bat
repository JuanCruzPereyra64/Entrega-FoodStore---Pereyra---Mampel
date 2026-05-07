@echo off
echo Iniciando Food Store v5.0...

echo Levantando Backend...
start "Food Store Backend" cmd /k "cd backend && uvicorn main:app --reload"

echo Levantando Frontend...
start "Food Store Frontend" cmd /k "cd frontend && npm run dev"

echo ========================================================
echo ¡Todo listo! Se abrieron dos consolas separadas para el 
echo backend (puerto 8000) y el frontend (puerto 5173).
echo Podes cerrar esta consola.
echo ========================================================
pause
