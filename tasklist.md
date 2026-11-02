# 🐱 TaskList
## Proceso [-] Finalizado [/] Falta [ ]
### BD
- [/] Fix de la bd para el nuevo planteo
- [/] Terminar el analisis de Reporte
- [/] Migracion: `reporte.gastos_totales` + borrar `anomalia.detalle_subanomalia`
### Vista
- ### Fix general
    - [/] vista general del menu nav -> bot
    - [/] Vista de reportes al cargar la app
    - [/] Vista de Avisos (boton AVISOS)
- ### Reporte
    - [/] Vista de Reportes en Menu
    - [/] Nuevo Reporte
    - [/] Quitar filtro por placa
    - [/] Habilitar inputs de peaje
    - [/] Quitar sub anomalia
    - [/] Gastos Totales = diesel + peaje + otros + anomalias
    - [/] Balance (ingresos - gastos)
- ### Flotas
    - [/] Vista de Flotas en Menu
    - [/] Nueva Flota
    - [ ] Editar Flota
    - [ ] Eliminar Flota
- ### Ruedas
    - [/] Vista de Ruedas Lote en Menu
    - [/] Fix de la vista en backend
    - [/] Nueva Rueda
    - [/] Info Rueda
    - [/] Nueva Marca Rueda
    - [ ] Editar Rueda codigo
    - [/] Eliminar Lote Rueda
- ### Aceite
    - [/] Vista de Aceite en Menu
    - [/] Nueva Lote Aceite
    - [/] Vista de Marcas de Aceite
    - [/] Nueva Marcas de Aceite
    - [/] Editar Aceite
    - [/] Eliminar Aceite
### Supabase (sucursal + login)
- [/] SQL Supabase: tabla sucursal, tipo_empleado -> rol, usuario admin
- [/] Migracion local: tabla usuarios_rol (login sin internet)
- [x] CRUD sucursal contra Supabase (fuente de verdad) + replica local
- [x] Login contra Supabase con roles (solo admin elimina)
- [x] Login sin internet (espejo local) + recordar usuario
- [x] Cambiar contrasena
- [x] Cola sync_pendiente: offline escribe local y sube al reconectar
- [x] Worker al loguear + auto-sync cada 5 min + badge de pendientes
- [x] Ejecutar SQL de Supabase y probar flujo completo end-to-end
## Notas
[/] Vamos a cambiar la estructura de rueda ya que esta rueda unitaria y no varias ruedas, error de abstraccion y herencia
[ ] Agregar las nuevas de Utils a newMarcaRuedaView
[ ] Agregar la anidacion de los label a los inputs
[ ] Modificar los nombres por orden
[ ] Agregar la validacion del input type Date (lote rueda)
[ ] Agregar los placeholders de loteRueda desde la marca y el autocompletado
[ ] Al hacer un reporte no olvidar colocar los viajes a Ruedas_Individuales