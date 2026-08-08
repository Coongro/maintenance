---
'@coongro/maintenance': patch
---

En una orden de trabajo se ve de qué propiedad es la unidad

Los selectores de propiedad y de unidad mostraban solo el nombre. Con dos «1°A» —uno en
Belgrano 1240 y otro en Salta 870— elegir era tirar una moneda, y mandar al plomero al
departamento equivocado no daba ningún error: la orden se guardaba contenta.

Ahora la unidad se lee «Belgrano 1240 · 1°A» con su detalle debajo, y la propiedad muestra
su dirección. El nombre calificado lo arma `properties`, dueño de las unidades, para que se
lea igual en todas las pantallas.

De paso, `src/agentic/contracts.ts` importaba `none` sin usarlo desde COONG-275. El lint del
plugin lo trata como error, así que `npm run quality` fallaba y con él el pre-push: cualquier
cambio en este plugin quedaba bloqueado hasta sacarlo.
