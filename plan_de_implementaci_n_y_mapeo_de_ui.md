# Plan de Implementación de Interfaz y Mapeo de Variables - Calendario de Viajes

Este documento sirve como guía para que **OpenCode** conecte las variables del estado global/backend con la interfaz gráfica basándose en los requerimientos del prototipo visual.

---

## 1. Mapeo de Filtros de Fecha y Controles Superiores

| Elemento Visual | Tipo de Componente | Variable / Binding (OpenCode) | Descripción / Evento |
| :--- | :--- | :--- | :--- |
| **Navegación `<`** | Botón Icono | `onClick={handlePrevPage}` | Retrocede según la vista activa (mes anterior, semana anterior o rango de días). |
| **Navegación `>`** | Botón Icono | `onClick={handleNextPage}` | Avanza según la vista activa. |
| **Buscador de Fecha** | Inputs / DatePicker | `selectedDay` (26)<br>`selectedMonth` (09)<br>`selectedYear` (2026) | Permite seleccionar una fecha exacta para saltar en el calendario. |
| **Filtro de Días / Vista** *(NUEVO)* | Selector / Tabs | `viewMode`: `'DAY' \| 'WEEK' \| 'MONTH' \| 'CUSTOM'` | **Agregar en la barra superior.** Controla la cantidad de días mostrados en la cuadrícula. |
| **Indicador "Año Actual"** | Label / Badge | `currentYear` | Muestra el año del periodo desplegado en la vista. |

---

## 2. Estructura de la Cuadrícula del Calendario (Grid/Cards)

La vista principal del calendario se divide en celdas de días (ej. Días 1, 2, 3, 4, 5, 6...). Cada celda debe renderizar un arreglo de eventos.

### A. Estructura de los Eventos por Día

Cada celda de día mapea un array de viajes: `dayEvents: Array<TripEvent>`.

| Texto en Boceto | Campo / Variable Sugerida | Tipo / Formato | Definición de Estado / Acción |
| :--- | :--- | :--- | :--- |
| **"Llegó"** | `event.type = 'ARRIVAL'` | Enum / String | Evento de llegada confirmada de la flota. |
| **"Partió"** | `event.type = 'DEPARTURE'` | Enum / String | Evento de salida/partida de la flota. |
| **"Llegada Estimada"** | `event.type = 'ESTIMATED_ARRIVAL'` | Enum / String | Indicado con línea punteada. Evento en tránsito pendiente. |
| **`{placa}` / `placa1`** | `event.vehicleId` / `event.licensePlate` | String | Identificador o número de placa de la flota asignada. |
| **Indicador "Hoy"** | `isToday: boolean` | Boolean | Resalta la celda o badge si `dayDate === currentDate`. |

---

## 3. Especificaciones Visuales y Estilos

1. **Llegadas y Salidas Confirmadas (`Llegó` / `Partió`):**
   * **Texto / Estilo:** Bloque continuo o texto sólido con su respectiva badge de estado (`Llegó` / `Partió`) seguido del binding `{licensePlate}`.

2. **Llegadas Estimadas (`Llegada Estimada`):**
   * **Estilo Visual:** Separador o contenedor con **borde inferior/superior punteado** (`border-dashed`).
   * **Contenido:** Label `"Llegada Estimada"` + `{licensePlate}`.

3. **Ubicación del Filtro de Días:**
   * Debe colocarse en la barra superior junto al control de **"Buscar Fecha"** para mantener consistencia UI.

---

## 4. Estructura de Datos Recomendada (JSON Schema)

OpenCode debe alimentar el componente con una estructura similar a la siguiente:

```json
{
  "selectedDate": "2026-09-26",
  "viewMode": "GRID_DAYS",
  "days": [
    {
      "dayNumber": 1,
      "date": "2026-09-01",
      "isToday": false,
      "events": [
        { "id": "ev-101", "type": "ARRIVAL", "licensePlate": "3542-XYZ", "time": "08:30" },
        { "id": "ev-102", "type": "DEPARTURE", "licensePlate": "1234-ABC", "time": "10:00" },
        { "id": "ev-103", "type": "ARRIVAL", "licensePlate": "9876-DEF", "time": "14:15" }
      ]
    },
    {
      "dayNumber": 3,
      "date": "2026-09-03",
      "isToday": false,
      "events": [
        { "id": "ev-104", "type": "ESTIMATED_ARRIVAL", "licensePlate": "1234-ABC", "time": "18:00" }
      ]
    },
    {
      "dayNumber": 5,
      "date": "2026-10-21",
      "isToday": true,
      "events": []
    }
  ]
}
```

---

## 5. Checklist de Tareas para OpenCode

- [ ] Agregar el componente de **Filtro de Días** (Día / Semana / Mes) en el header superior.
- [ ] Mapear el botón de navegación izquierda (`<`) y derecha (`>`) con la función de desplazamiento de fechas.
- [ ] Conectar los controles dinámicos de selección de **Día/Mes/Año** al estado global de filtro.
- [ ] Iterar los días en la cuadrícula usando el arreglo `days`.
- [ ] Renderizar condicionalmente los tipos de eventos (`Llegó`, `Partió`, `Llegada Estimada`).
- [ ] Aplicar la clase/estilo punteado (`border-dashed`) para la fila/card de `Llegada Estimada`.
- [ ] Agregar el indicador visual o tag para el día marcado como `"hoy"`.
```

eof

El plan detallado ha sido generado en el documento adjunto con toda la estructura de componentes, mapeo de variables y el schema JSON que OpenCode necesita para conectar la interfaz. 

¿Hay algún detalle adicional o regla de negocio sobre las flotas/placas que desees incluir en el plan?