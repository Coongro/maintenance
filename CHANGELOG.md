# @coongro/maintenance

## 0.2.0

### Minor Changes

- 0b31094: feat: cerrar una orden con costo registra la salida de plata (COONG-275)

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

- 92f9a52: feat: Mantenimiento muestra qué pasó con la plata de cada arreglo (COONG-275)

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

- 131237e: El catálogo de capacidades del plugin, declarado en código y certificado

  Las cinco capacidades de órdenes de trabajo se declaran con Action Contracts junto a su handler. Se dejan de publicar las de otros plugins que este delegaba: publica el dueño del recurso, así el agente ve una sola herramienta por operación y con el texto de quien la escribió.

- 3f71d22: feat: órdenes de trabajo del inmueble (COONG-275)

  Primera versión: los arreglos que pide el inquilino o detecta el propietario, con su prioridad,
  rubro, a quién se asignó y cuánto costó. Se cargan y se siguen desde la vista de Mantenimiento, y
  las abiertas de una propiedad aparecen en su ficha.

### Patch Changes

- 196d35c: Una orden cargada por error se puede eliminar, y no puede quedar entre dos propiedades.

  El listado gana su acción de eliminar. Se niega si la orden ya generó un egreso en Caja o un cargo al inquilino: esas líneas la referencian, y borrarla las dejaría apuntando a un arreglo que para el sistema no existió. En ese caso lo que corresponde es cancelarla, que su propio estado ya sabe expresar.

  Y la unidad tiene que pertenecer a la propiedad elegida. El desplegable lista las de toda la cartera, así que elegir una de otra propiedad es un click — y el resultado no era un dato raro sino contradictorio: la orden aparecía en las dos a la vez. La regla no se copió acá: es de `properties`, que es el dueño de edificios y unidades y el único que puede contestar de cuál es realmente una unidad.

- a9cd38e: En una orden de trabajo se ve de qué propiedad es la unidad

  Los selectores de propiedad y de unidad mostraban solo el nombre. Con dos «1°A» —uno en
  Belgrano 1240 y otro en Salta 870— elegir era tirar una moneda, y mandar al plomero al
  departamento equivocado no daba ningún error: la orden se guardaba contenta.

  Ahora la unidad se lee «Belgrano 1240 · 1°A» con su detalle debajo, y la propiedad muestra
  su dirección. El nombre calificado lo arma `properties`, dueño de las unidades, para que se
  lea igual en todas las pantallas.

  De paso, `src/agentic/contracts.ts` importaba `none` sin usarlo desde COONG-275. El lint del
  plugin lo trata como error, así que `npm run quality` fallaba y con él el pre-push: cualquier
  cambio en este plugin quedaba bloqueado hasta sacarlo.
