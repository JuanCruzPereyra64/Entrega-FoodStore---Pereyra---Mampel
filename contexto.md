# Contexto de Desarrollo - Sesión Actual

## 1. Objetivo Actual
Corregir y finalizar el formulario de creación/edición de productos (`ProductoModal`) en el panel de administrador. Actualmente, el formulario presenta problemas de usabilidad y falta de feedback al interactuar con el backend.

## 2. Archivos en los que veníamos trabajando
- `frontend/src/pages/admin/productos/index.tsx` (Foco principal: arreglar el `ProductoModal`)
- `frontend/src/app/index.tsx` (Recientemente modificado para routing basado en roles)
- `frontend/src/widgets/layout/MainLayout.tsx` (Recientemente modificado para sidebar dinámico)

## 3. Errores Pendientes / Bugs Actuales
- **Fallo silencioso al guardar:** Al hacer clic en "Guardar" al crear un producto (ej. "bondiola a la parrilla"), la mutación falla silenciosamente. No se muestra ningún mensaje de error al usuario y el modal no se cierra. Probablemente haya un error de validación en la API (ej. campos faltantes o formato incorrecto).
- **Usabilidad de inputs numéricos:** Los campos de "Precio" y "Stock" se inicializan con un `0`. Al escribir, el `0` se mantiene como prefijo (ej. al escribir `5` queda `05`). Esto se debe a cómo se maneja el estado del input (`value={form.precio_base}` con inicialización en `0` y casteo directo a `Number`).

## 4. Próximo Paso Exacto a Ejecutar
1. **Refactorizar `ProductoModal` en `frontend/src/pages/admin/productos/index.tsx`:**
   - Cambiar el estado inicial de `precio_base` y `stock_cantidad` para manejar strings vacíos (`''`) en lugar de `0` estrictos en el frontend, y solo castear a número al enviar a la API.
   - Agregar renderizado de errores en la UI para `saveMutation.isError` (mostrando `saveMutation.error?.response?.data?.detail` u otro mensaje adecuado).
   - Revisar el payload que se envía en `createProductoApi(form)` para asegurar que cumple con el schema del backend (por ejemplo, si la API requiere campos que no se están enviando o si se envían vacíos).
