🐱ENTIDADES: FLOTAS, RUEDAS, ACEITE, REGISTRO
    FLOTAS (placa, propietario, chofer, licencia, estado)
        - estado [viajando = 1, estacionado = 2, mecanico = 3]

    RUEDAS (id_rds, placa, diametro(cm), grosor(cm), espesor(mm), costo(bs), viajes, limite_viajes, estado)
        - viajes: numero de viajes realizados
        - limite_viajes: limite de viajes recomendado para la rueda 
        - estado [activo = 1, baja = 2]

    ACEITE (id_act, placa, cantidadIni(lt), cantidadAc(lt), costo(bs), viajes, limite_viajes, estado)
        - cantidadIni: cantidad inicial comprada
        - cantidadAc: cantidad de aceite acutal
        - viajes: numero de viajes realizados
        - limite_viajes: limite de viajes recomendado para el aceite
        - estado [porcentual%]

    REGISTRO_FLOTA (id_reg, placa, fecha_partida, fecha_llegada, pasajes(bs), encomiendas(bs) origen, destino)

    REGISTRO_RUEDA (id_rr, placa, fecha_partida, fecha_llegada, detalle, destino, origen)
        - detalle: cualquier nota respecto a la rueda

    REGISTRO_ACEITE (id_ra, placa, fecha_partida, fecha_llegada, detalle, destino, origen)
        - detalle: cualquier nota respecto al aceite

    DESCRIPCION_FLOTA(id_df, titulo, descripcion, gasto(bs))

    AUTO (titulo_df)
        - titulo_df: autorellenado de posibles problemas para un titulo de una descripcion de flota
            [GASTO, COMBUSTIBLE, BIATICOS, FALLA MECANICA]

-- Separador $#$






🐱🐱🐱🐱REQUERIMIENTOS🐱🐱🐱🐱

CRUD de Entidades

AGREGAR DATOS A FLOTAS
|_ DATOS DE LA HOJA



FUNCIONALIDADES DE SECCION
LLEGADAS
| MENU.HTML (BUTT VER RUEDA, BUTT VER ACEITE, BUTT FLOTAS)
    | RUEDA.HTML (CREA RUEDA)
        | NUEVA RUEDA
        | EDITAR RUEDA
        | ELIMINAR RUEDA
        | MAS INFORMACION DE LA RUEDA
    | ACEITE.HTML (EDITAR RUEDA)
        | NUEVA ACEITE
        | EDITAR ACEITE
        | ELIMINAR ACEITE
        | MAS INFORMACION DE LA ACEITE
    | FLOTA.HTML (CREA FLOTA)
        | NUEVA FLOTA
        | EDITAR FLOTA
        | ELIMINAR FLOTA
        | MAS INFORMACION DE LA FLOTA

🐱



EAY 3056-EAY HUGO GABRIEL RASGUIDO 8036400
BNE 1803-BNE
FIU 1800-FIU MARIO CRUZ LACATO 7995969
DER 2537-DER REINALDO JORGE OCZACHOQUE 3531243
UKF 2996-UKF JHONNY VARGAS HERBAS 3780185
CPE 2447-CPE ELOY TERCEROS MONTAÑO 4512727
RXU 2494-RXU CALIXTO ANDIA QUINTEROS 2951649
TFU 2550-TFU DEMETRIO GALINDO MERIDA 4438619
UKE 1194-UKE ERICK MENDOZA MONTESINOS 6472193
UTA 2830-UTA ARIEL VARGAS VALLEJOS 7939232
KUX 1461-KUX WILSON LAZARTE MONTAÑO 8691695
EYR 1580-EYR JUAN QUISPE LLAMPAS 4321568
YXG 2130-YXG JHONNY VARGAS 6053938
DKT 2447-DKT RICHAR IRUSTA JIMENEZ 4560090
YNF 2701-YNF ARCENIO CABALLERO V. 3567742
KGD 2264-KGD VICTOR HUGO VELARSCO CAERO 4403658

PCT 2218-PCT ALEX SANDRO VILLARROEL ROMERO 4512363

BNE CARMEN VELASCO
CPE ELOY TERCEROS
DER REINALDO ALBERTO
DKT RICHAR IRUSTA
EAY JHONNY CABALLERO
EYR JUAN QUISPE LLAMPA
FIU MIGUELINA PEREDO
KGD VICTOR HUGO VELASCO
KUX VIVIAN CABALLERO
RXU JHONNY CABALLERO
TFU RUTH CABALLERO
UKE ERICK MENDOZA
UKF JHONNY CABALLERO
UTA JHONNY CABALLERO
YNF JHONNY CABALLERO
YXG JHONNY VARGAS
