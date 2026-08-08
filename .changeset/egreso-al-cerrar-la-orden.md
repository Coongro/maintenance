---
'@coongro/maintenance': minor
---

feat: cerrar una orden con costo registra la salida de plata (COONG-275)

El costo de un arreglo existía en la ficha de la orden y en ningún lado más. La pregunta «cuánto me
cuesta mantener esta propiedad» no se podía responder con lo que el sistema tenía: la plata salía y
la caja no se enteraba.

Ahora una orden terminada con costo genera su egreso, a nombre del proveedor y con la fecha del
trabajo. Qué decide si corresponde es el campo **«Lo paga»**:

- **El propietario** — le paga al proveedor. Egreso.
- **El inquilino** — el propietario adelanta el pago y después se lo recupera en el recibo (eso lo
  hace `leases`). Egreso igual: la plata salió, aunque vuelva.
- **El consorcio** — sin egreso. Ese arreglo le llega al propietario prorrateado en la liquidación
  de expensas extraordinarias, que el kit ya registra; anotarlo también acá contaría el mismo gasto
  dos veces.

La cuenta queda **abierta**, sin dar el pago por hecho: cerrar la orden dice cuánto costó, no que ya
se le pagó al plomero ni con qué medio. Aparece como deuda al proveedor y el pago se registra cuando
ocurre — darlo por pagado descuadraría el arqueo con plata que sigue en el cajón.

Es una sincronización, no un alta: corregir el costo corrige el egreso, y reabrir la orden o pasarla
a «la paga el consorcio» lo elimina. Guardar dos veces nunca duplica. Un egreso que ya tiene pagos
registrados no se toca: ahí la plata ya se movió y el desajuste se resuelve a mano.
