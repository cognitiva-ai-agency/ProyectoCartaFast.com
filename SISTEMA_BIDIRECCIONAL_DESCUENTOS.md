# Sistema Bidireccional de Descuentos

## Concepto
El sistema permite editar promociones de dos formas diferentes, calculando automáticamente el campo complementario:

1. **Editar Porcentaje de Descuento** → Calcula automáticamente el Precio Final
2. **Editar Precio Final** → Calcula automáticamente el Porcentaje de Descuento

## Implementación

### 1. Estados Locales
```typescript
const [isEditingDiscount, setIsEditingDiscount] = useState(false)
const [isEditingFinalPrice, setIsEditingFinalPrice] = useState(false)
const [localDiscount, setLocalDiscount] = useState<string>(String(item.discount_percentage || 0))
const [localFinalPrice, setLocalFinalPrice] = useState<string>(
  String(item.base_price * (1 - (item.discount_percentage || 0) / 100))
)
```

### 2. Sincronización con el Servidor
```typescript
// Sync local final price when base_price or discount_percentage changes
useEffect(() => {
  if (!isEditingFinalPrice) {
    const calculatedFinalPrice = item.base_price * (1 - (item.discount_percentage || 0) / 100)
    setLocalFinalPrice(String(calculatedFinalPrice))
  }
}, [item.base_price, item.discount_percentage])
```

### 3. Handlers para Descuento (% → Precio Final)
```typescript
const handleDiscountChange = (newDiscount: string) => {
  setLocalDiscount(newDiscount)

  const discount = parseFloat(newDiscount.replace(/[^0-9.]/g, ''))
  if (!isNaN(discount) && discount >= 0 && discount <= 100) {
    // Calcular precio final automáticamente
    const calculatedFinalPrice = item.base_price * (1 - discount / 100)
    setLocalFinalPrice(String(calculatedFinalPrice))
  }
}

const handleDiscountBlur = () => {
  setIsEditingDiscount(false)
  const discount = parseFloat(localDiscount.replace(/[^0-9.]/g, ''))

  if (!isNaN(discount) && discount >= 0 && discount <= 100 && discount !== item.discount_percentage) {
    onUpdate(item.id, { discount_percentage: discount })
  } else if (isNaN(discount) || discount < 0 || discount > 100) {
    setLocalDiscount(String(item.discount_percentage || 0))
    const calculatedFinalPrice = item.base_price * (1 - (item.discount_percentage || 0) / 100)
    setLocalFinalPrice(String(calculatedFinalPrice))
  }
}
```

### 4. Handlers para Precio Final (Precio → %)
```typescript
const handleFinalPriceChange = (newFinalPrice: string) => {
  setLocalFinalPrice(newFinalPrice)

  const finalPrice = parseFloat(newFinalPrice.replace(/[^0-9.]/g, ''))
  if (!isNaN(finalPrice) && finalPrice >= 0 && finalPrice <= item.base_price) {
    // Calcular porcentaje de descuento automáticamente
    const calculatedDiscount = ((item.base_price - finalPrice) / item.base_price) * 100
    setLocalDiscount(String(Math.round(calculatedDiscount * 100) / 100))
  }
}

const handleFinalPriceBlur = () => {
  setIsEditingFinalPrice(false)
  const finalPrice = parseFloat(localFinalPrice.replace(/[^0-9.]/g, ''))

  if (!isNaN(finalPrice) && finalPrice >= 0 && finalPrice <= item.base_price) {
    // Calcular y guardar el porcentaje de descuento
    const calculatedDiscount = ((item.base_price - finalPrice) / item.base_price) * 100
    onUpdate(item.id, { discount_percentage: Math.round(calculatedDiscount * 100) / 100 })
  } else if (isNaN(finalPrice) || finalPrice < 0 || finalPrice > item.base_price) {
    const calculatedFinalPrice = item.base_price * (1 - (item.discount_percentage || 0) / 100)
    setLocalFinalPrice(String(calculatedFinalPrice))
  }
}
```

### 5. UI con Dos Campos Editables
```typescript
{item.is_promotion && (
  <div className="flex flex-col gap-2">
    {/* Campo 1: Editar Porcentaje */}
    <div className="flex items-center gap-1 bg-ios-red/5 px-3 py-2 rounded-lg border-2 border-ios-red/20">
      <span className="text-xs font-medium text-ios-gray-600">Descuento:</span>
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
      <span className="text-xs font-medium text-ios-gray-600">%</span>
    </div>

    {/* Campo 2: Editar Precio Final */}
    <div className="flex items-center gap-1 bg-ios-green/5 px-3 py-2 rounded-lg border-2 border-ios-green/20">
      <span className="text-xs font-medium text-ios-gray-600">Precio final: {currencyData.symbol}</span>
      <ContentEditable
        value={
          isEditingFinalPrice
            ? localFinalPrice
            : formatPriceForDisplay(parseFloat(localFinalPrice), currencyData.decimals)
        }
        onChange={handleFinalPriceChange}
        onFocus={handleFinalPriceFocus}
        onBlur={handleFinalPriceBlur}
        placeholder="0"
        className={cn(
          "text-base font-bold text-ios-green min-w-[60px]",
          isEditingFinalPrice && "bg-white px-2 py-1 rounded border-2 border-ios-green shadow-sm"
        )}
      />
    </div>
  </div>
)}
```

## Flujos de Uso

### Escenario 1: Editar por Porcentaje
**Ejemplo**: Plato cuesta $10.000, quiero aplicar 25% de descuento

1. Activa la promoción (click en 💵)
2. Aparecen dos campos:
   - **Descuento: 10%** (rojo)
   - **Precio final: $9.000** (verde)
3. Click en "10" (campo rojo)
4. Cambiar a "25"
5. **Mientras escribes**: El precio final se actualiza en tiempo real → $7.500
6. Presionar Enter
7. ✅ Se guarda: discount_percentage = 25%, precio final = $7.500

### Escenario 2: Editar por Precio Final
**Ejemplo**: Plato cuesta $10.000, quiero venderlo a $6.000

1. Activa la promoción (click en 💵)
2. Aparecen dos campos:
   - **Descuento: 10%** (rojo)
   - **Precio final: $9.000** (verde)
3. Click en "$9.000" (campo verde)
4. Cambiar a "6000"
5. **Mientras escribes**: El porcentaje se actualiza en tiempo real → 40%
6. Presionar Enter
7. ✅ Se guarda: discount_percentage = 40%, precio final = $6.000

### Escenario 3: Cambiar de Método
**Ejemplo**: Primero editas el porcentaje, luego cambias de opinión y editas el precio

1. Precio base: $10.000
2. Editas porcentaje: 20% → Precio final = $8.000
3. Cambias de opinión: Click en el precio final
4. Editas precio: $7.000
5. **El sistema recalcula**: Porcentaje = 30%
6. Presionar Enter
7. ✅ Se guarda: discount_percentage = 30%, precio final = $7.000

## Fórmulas

### De Porcentaje a Precio Final
```typescript
precio_final = precio_base * (1 - porcentaje / 100)

// Ejemplo:
// precio_base = 10000
// porcentaje = 25
// precio_final = 10000 * (1 - 25/100) = 10000 * 0.75 = 7500
```

### De Precio Final a Porcentaje
```typescript
porcentaje = ((precio_base - precio_final) / precio_base) * 100

// Ejemplo:
// precio_base = 10000
// precio_final = 6000
// porcentaje = ((10000 - 6000) / 10000) * 100 = (4000 / 10000) * 100 = 40
```

## Validaciones

### Campo de Porcentaje
- ✅ Acepta: 0 - 100
- ❌ Rechaza: Negativos, > 100, texto
- Si es inválido: Revierte al valor anterior

### Campo de Precio Final
- ✅ Acepta: 0 - precio_base
- ❌ Rechaza: Negativos, > precio_base, texto
- Si es inválido: Revierte al valor calculado

## Casos de Prueba

| Escenario | Precio Base | Acción | Resultado |
|-----------|-------------|--------|-----------|
| **Por Porcentaje** | $10.000 | Editar descuento a 25% | Precio final = $7.500 |
| **Por Precio Final** | $10.000 | Editar precio a $6.000 | Descuento = 40% |
| **Descuento 0%** | $10.000 | Editar descuento a 0% | Precio final = $10.000 |
| **Descuento 100%** | $10.000 | Editar descuento a 100% | Precio final = $0 |
| **Precio = Base** | $10.000 | Editar precio a $10.000 | Descuento = 0% |
| **Precio = 0** | $10.000 | Editar precio a $0 | Descuento = 100% |
| **Inválido %** | $10.000 | Editar descuento a 150% | Revierte al valor anterior |
| **Inválido Precio** | $10.000 | Editar precio a $15.000 | Revierte al valor calculado |
| **Cambio de método** | $10.000 | 20% → $7.000 | Descuento = 30% |

## Ventajas del Sistema Bidireccional

### ✅ Flexibilidad
- Algunos usuarios piensan en porcentajes (ej: "25% off")
- Otros usuarios piensan en precios exactos (ej: "vender a $7.500")
- El sistema se adapta a ambos estilos

### ✅ Transparencia
- Ambos valores siempre visibles
- Los cambios se reflejan en tiempo real
- No hay sorpresas al guardar

### ✅ Menos Errores
- Validación automática en ambos campos
- Si un valor es inválido, se revierte automáticamente
- No se puede guardar un estado inconsistente

### ✅ Eficiencia
- Un solo campo de base de datos: `discount_percentage`
- El precio final es calculado, no almacenado
- Consistencia garantizada

## Código Clave

### Cálculo en Tiempo Real
```typescript
// onChange del porcentaje
const discount = parseFloat(newDiscount.replace(/[^0-9.]/g, ''))
if (!isNaN(discount) && discount >= 0 && discount <= 100) {
  const calculatedFinalPrice = item.base_price * (1 - discount / 100)
  setLocalFinalPrice(String(calculatedFinalPrice))
}

// onChange del precio final
const finalPrice = parseFloat(newFinalPrice.replace(/[^0-9.]/g, ''))
if (!isNaN(finalPrice) && finalPrice >= 0 && finalPrice <= item.base_price) {
  const calculatedDiscount = ((item.base_price - finalPrice) / item.base_price) * 100
  setLocalDiscount(String(Math.round(calculatedDiscount * 100) / 100))
}
```

### Sincronización con el Servidor
```typescript
// Solo se guarda el porcentaje
onUpdate(item.id, { discount_percentage: calculatedDiscount })

// El precio final se calcula en el servidor/cliente cuando sea necesario
```

## Mejoras Futuras (Opcional)

1. **Tooltips Explicativos**:
   - Mostrar ejemplo: "Ej: 25% = $7.500"
   - Ayudar al usuario a entender la relación

2. **Presets Rápidos**:
   - Botones: 10%, 20%, 30%, 50%
   - Precios comunes: $5.000, $7.500, $10.000

3. **Historial de Descuentos**:
   - Recordar descuentos usados anteriormente
   - Sugerir descuentos populares

4. **Validación Visual Mejorada**:
   - Color amarillo si el descuento es muy alto (>70%)
   - Confirmar si el descuento es 100%

## Resultado Final

**Antes**:
- ❌ Solo se podía ingresar porcentaje de descuento
- ❌ No se veía el precio final hasta guardar
- ❌ Difícil para usuarios que piensan en precios exactos

**Después**:
- ✅ Se puede editar tanto el porcentaje como el precio final
- ✅ Los cambios se reflejan en tiempo real
- ✅ Sistema flexible que se adapta al usuario
- ✅ Validación automática en ambos campos
- ✅ Imposible crear estados inconsistentes
- ✅ UX intuitiva con colores distintivos (rojo para %, verde para precio)
