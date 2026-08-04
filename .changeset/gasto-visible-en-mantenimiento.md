---
'@coongro/maintenance': minor
---

feat: Mantenimiento muestra qué pasó con la plata de cada arreglo (COONG-275)

Cerrar una orden ya generaba el egreso al proveedor y el cargo al inquilino, pero eso ocurría sin
que se viera en ninguna pantalla: la única forma de saber si había pasado era mirar la base. Un
registro que nadie puede consultar es lo mismo que no tenerlo.

Cada fila ahora dice en qué quedó su plata: **Egreso** (a pagar / pagado) y **Al inquilino** (falta
cargarlo / en su recibo). Con eso, cerrar una orden deja de ser un acto a ciegas.

Y arriba, tres números que responden cuánto cuesta mantener la cartera este año:

- **Gasto a tu cargo** — lo que sale del bolsillo del propietario y no vuelve.
- **Le debés al proveedor** — egresos registrados que todavía nadie pagó.
- **Recuperás del inquilino** — lo adelantado por cuenta suya, que vuelve en su recibo.

Los tres están separados a propósito. Un arreglo que se le recupera al inquilino **no es un gasto
del propietario**: entra y sale. Sumarlos daría un número inflado justo cuando sirve para decidir —
a fin de año, si conviene deducir gastos reales o el 5% presunto de Ganancias, una opción que ata
por cinco años. Ese número tiene que ser el que de verdad salió del bolsillo.

El corte es anual porque la decisión que hay detrás lo es. El rubro deja de ser columna y pasa a
filtro: no cambiaba ninguna decisión al escanear la lista, y el lugar hacía falta.
