# Feature: Campo Editable de Precio de Promoción

## Problema
Al activar la promoción de un plato con el botón 💵/🏷️ en el Editor de Menú, el sistema marcaba el plato como promoción pero **no había forma de ingresar el porcentaje de descuento**, por lo que la promoción no se reflejaba en el precio.

## Solución Implementada

### 1. Estado Local para Descuento
Agregamos estado local similar al del precio:

```typescript
const [isEditingDiscount, setIsEditingDiscount] = useState(false)
const [localDiscount, setLocalDiscount] = useState<string>(String(item.discount_percentage || 0))
```

### 2. Sincronización con el Servidor
```typescript
useEffect(() => {
  if (!isEditingDiscount) {
    setLocalDiscount(String(item.discount_percentage || 0))
  }
}, [item.discount_percentage])
```

### 3. Handlers para Edición de Descuento
```typescript
const handleDiscountChange = (newDiscount: string) => {
  setLocalDiscount(newDiscount)
}

const handleDiscountBlur = () => {
  setIsEditingDiscount(false)
  const discount = parseFloat(localDiscount.replace(/[^0-9.]/g, ''))

  // Validar rango: 0-100%
  if (!isNaN(discount) && discount >= 0 && discount <= 100 && discount !== item.discount_percentage) {
    onUpdate(item.id, { discount_percentage: discount })
  } else if (isNaN(discount) || discount < 0 || discount > 100) {
    setLocalDiscount(String(item.discount_percentage || 0))
  }
}

const handleDiscountFocus = () => {
  setIsEditingDiscount(true)
  setLocalDiscount(String(item.discount_percentage || 0))
}
```

### 4. Toggle Mejorado con Descuento por Defecto
```typescript
const handleTogglePromotion = () => {
  if (!item.is_promotion) {
    // Al activar: establecer 10% por defecto si no hay descuento
    onUpdate(item.id, {
      is_promotion: true,
      discount_percentage: item.discount_percentage || 10
    })
  } else {
    // Al desactivar: mantener el descuento pero apagar la promoción
    onUpdate(item.id, { is_promotion: false })
  }
}
```

### 5. UI Editable para el Descuento
```typescript
{item.is_promotion && (
  <div className="flex items-center gap-1 bg-ios-red/5 px-3 py-2 rounded-lg border-2 border-ios-red/20 hover:border-ios-red/40 transition-all">
    <span className="text-xs font-medium text-ios-gray-600">-</span>
    <ContentEditable
      value={isEditingDiscount ? localDiscount : String(item.discount_percentage || 0)}
      onChange={handleDiscountChange}
      onFocus={handleDiscountFocus}
      onBlur={handleDiscountBlur}
      placeholder="0"
      className={cn(
        "text-base font-bold text-ios-red min-w-[40px]",
        isEditingDiscount && "bg-white px-2 py-1 rounded border-2 border-ios-red shadow-sm"
      )}
    />
    <span className="text-xs font-medium text-ios-gray-600">% = {currencyData.symbol}</span>
    <span className="text-base font-semibold text-ios-red min-w-[60px]">
      {formatPriceForDisplay(
        item.base_price * (1 - (item.discount_percentage || 0) / 100),
        currencyData.decimals
      )}
    </span>
  </div>
)}
```

## Características

### ✅ Validación de Entrada
- Solo acepta números entre 0 y 100
- Si el valor es inválido, revierte al anterior
- No permite valores negativos o mayores a 100%

### ✅ Descuento por Defecto
- Al activar la promoción, automáticamente establece 10% de descuento
- El usuario puede editarlo inmediatamente

### ✅ Cálculo Automático de Precio Final
- El precio final se calcula automáticamente: `base_price * (1 - discount_percentage / 100)`
- Se muestra en tiempo real mientras el usuario edita

### ✅ Misma UX que Precio Normal
- Usa el mismo patrón de edición inline
- Click para editar → Enter para guardar
- Indicadores visuales al editar (borde, fondo)

## Flujo de Uso

1. **Activar Promoción**:
   - Click en el botón 💵 → cambia a 🏷️
   - Aparece el campo de descuento con 10% por defecto
   - Se muestra el precio final calculado

2. **Editar Descuento**:
   - Click en el porcentaje (ej: "10")
   - Cambiar el valor (ej: "20")
   - Presionar Enter o hacer click afuera
   - El precio final se actualiza automáticamente

3. **Desactivar Promoción**:
   - Click en el botón 🏷️ → cambia a 💵
   - El campo de descuento desaparece
   - El descuento se mantiene guardado por si se reactiva

## Archivo Modificado
- `components/editor/DraggableMenuItem.tsx`

## Mejoras Futuras (Opcional)

1. **Precio Promocional Directo**:
   - Permitir ingresar el precio final en lugar del porcentaje
   - Calcular automáticamente el porcentaje de descuento

2. **Validación Visual**:
   - Mostrar error si el descuento es mayor al 100%
   - Advertencia si el descuento es muy alto (ej: >80%)

3. **Presets de Descuento**:
   - Botones rápidos: 10%, 20%, 30%, 50%
   - Click rápido para aplicar descuentos comunes

4. **Descuento por Monto**:
   - Permitir ingresar descuento en dinero (ej: $2000 off)
   - Convertir automáticamente a porcentaje

## Testing

### Cómo Probar
1. Ve a "Editor de Menú"
2. Selecciona cualquier plato
3. Click en el botón 💵 (a la derecha del plato)
4. ✅ Debe aparecer un campo con "10%" editable
5. ✅ Debe mostrar el precio final calculado
6. Click en "10" y cambiarlo a "25"
7. Presionar Enter
8. ✅ El precio final debe actualizarse: `precio_base * 0.75`
9. Recargar la página
10. ✅ El descuento debe persistir

### Casos de Prueba

| Acción | Resultado Esperado |
|--------|-------------------|
| Activar promoción | Aparece campo con 10% por defecto |
| Editar a 20% | Precio final = precio_base * 0.80 |
| Editar a 50% | Precio final = precio_base * 0.50 |
| Editar a 0% | Precio final = precio_base |
| Editar a 100% | Precio final = $0 |
| Editar a -10% | Revierte al valor anterior |
| Editar a 150% | Revierte al valor anterior |
| Editar "abc" | Revierte al valor anterior |
| Desactivar promoción | Campo desaparece, descuento se guarda |
| Reactivar promoción | Reaparece con el último descuento |

## Resultado Final

**Antes**:
- ❌ Al activar promoción, no se podía ingresar descuento
- ❌ La promoción no tenía efecto visible en el precio
- ❌ No había forma de especificar el precio promocional

**Después**:
- ✅ Al activar promoción, aparece campo editable con 10% por defecto
- ✅ Se puede editar el porcentaje de descuento directamente
- ✅ El precio final se calcula y muestra en tiempo real
- ✅ Validación automática (0-100%)
- ✅ Misma UX que otros campos editables
- ✅ Los cambios persisten correctamente
