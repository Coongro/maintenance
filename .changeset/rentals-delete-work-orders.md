---
'@coongro/maintenance': patch
---

Una orden cargada por error se puede eliminar, y no puede quedar entre dos propiedades.

El listado gana su acción de eliminar. Se niega si la orden ya generó un egreso en Caja o un cargo al inquilino: esas líneas la referencian, y borrarla las dejaría apuntando a un arreglo que para el sistema no existió. En ese caso lo que corresponde es cancelarla, que su propio estado ya sabe expresar.

Y la unidad tiene que pertenecer a la propiedad elegida. El desplegable lista las de toda la cartera, así que elegir una de otra propiedad es un click — y el resultado no era un dato raro sino contradictorio: la orden aparecía en las dos a la vez. La regla no se copió acá: es de `properties`, que es el dueño de edificios y unidades y el único que puede contestar de cuál es realmente una unidad.
