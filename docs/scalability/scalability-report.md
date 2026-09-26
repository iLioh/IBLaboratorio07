# Evaluación de escalabilidad – TechBank

## Arquitectura evaluada

La evaluación se realizó sobre el entorno académico QA de TechBank Operations Center, publicado en Azure Container Apps. La aplicación es un único contenedor Node.js que sirve la SPA React y la API Express. La imagen desplegada es `acrtechbanks7brazilsouth.azurecr.io/techbank:8f60360a51aac04dbf4425a6c7584a40bec274e8`, obtenida desde Azure Container Registry por el pipeline v1.1.0.

La Container App `ca-techbank-s7-qa`, dentro de `cae-techbank-s7-qa` en Brazil South, estaba en estado `Succeeded`, `Running` y `Healthy` al registrar la línea base. Su configuración real asigna 0.25 vCPU y 0.5 GiB de memoria por réplica. El escalado está acotado a un mínimo de una y un máximo de tres réplicas, por lo que el servicio mantiene una instancia disponible y puede distribuir tráfico en instancias adicionales dentro de ese límite.

## Prueba realizada

Se añadió `tests/load/k6-qa.js`, una prueba k6 moderada que exige `BASE_URL` y consulta `GET /health`, `GET /api/transactions` y `GET /api/metrics`. La secuencia dura aproximadamente un minuto: 10 segundos hasta 5 VUs, 20 segundos hasta 20 VUs, 20 segundos hasta 30 VUs y 10 segundos de descenso a cero. No es una prueba de estrés destructiva.

Los thresholds definidos son una tasa de fallos HTTP menor al 1 %, p95 menor a 1000 ms y más del 99 % de checks exitosos. La ejecución realizada fue:

```bash
k6 run -e BASE_URL=https://ca-techbank-s7-qa.victoriousdesert-e29e6577.brazilsouth.azurecontainerapps.io tests/load/k6-qa.js
```

Se ejecutó localmente con k6 v2.2.0. La carga completó sus cuatro etapas sin modificar Azure ni el script. La salida íntegra se conserva en `docs/evidence/qa/k6-output.txt`.

## Resultados observados

| Métrica                       | Resultado                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Requests totales              | 1227                                                                                                         |
| Requests por segundo          | 20.049006/s                                                                                                  |
| Latencia promedio             | 604.86 ms                                                                                                    |
| Latencia p95                  | 613.09 ms                                                                                                    |
| Tasa de error HTTP            | 0.00 % (0 de 1227)                                                                                           |
| Checks                        | 100.00 % (1227 de 1227)                                                                                      |
| VUs máximos                   | 30                                                                                                           |
| Réplicas antes de la prueba   | 1                                                                                                            |
| Máximo de réplicas observado  | 3                                                                                                            |
| Réplicas después de la prueba | 3 en las tres muestras posteriores inmediatas                                                                |
| CPU y memoria observadas      | Configuración: 0.25 vCPU y 0.5 GiB por réplica; uso en tiempo real no disponible por CLI en esta evaluación. |

Todos los thresholds pasaron: `http_req_failed` fue 0.00 % frente a un máximo de 1 %, p95 fue 613.09 ms frente a un máximo de 1000 ms y los checks fueron 100.00 % frente a un mínimo de 99 %. El historial temporal íntegro está en `docs/evidence/qa/scaling-observation.txt`.

## Escalabilidad vertical

La escalabilidad vertical incrementa CPU o memoria asignada a cada réplica. Para TechBank, elevar los 0.25 vCPU o 0.5 GiB podría reducir contención de recursos si una sola instancia está saturada. Es una intervención simple, pero conserva un límite físico por réplica y normalmente implica aplicar una nueva revisión; no sustituye la disponibilidad que brindan varias instancias.

## Escalabilidad horizontal y autoscaling

La escalabilidad horizontal aumenta el número de réplicas. Azure Container Apps está configurado con `minReplicas: 1` y `maxReplicas: 3`, de modo que puede sostener de una a tres instancias. La regla HTTP real se llama `http-scaler` y utiliza `concurrentRequests: 10`. Esto expresa un umbral explícito de concurrencia: si la concurrencia sostenida supera la capacidad objetivo, KEDA puede solicitar más réplicas, sin exceder tres.

La carga alcanzó 30 VUs y se observó el paso de 1 a 3 réplicas mientras estaba activa. Por lo tanto, esta ejecución aporta evidencia empírica de autoscaling horizontal real dentro del máximo configurado. Las muestras posteriores inmediatas todavía mostraron tres réplicas; no se infiere un tiempo de reducción porque no fue medido hasta el downscale completo.

## Conclusión técnica

QA cuenta con una configuración de escalabilidad horizontal verificable, limitada y adecuada para el laboratorio: una réplica base, máximo tres y una regla HTTP explícita. La prueba k6 moderada pasó todos sus thresholds y se observó autoscaling horizontal de 1 a 3 réplicas. Esto valida el comportamiento dentro de la carga y ventana observadas, sin extrapolar capacidad productiva ni afirmar métricas de CPU/memoria no medidas.
