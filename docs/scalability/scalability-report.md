# Evaluación de escalabilidad – TechBank

## Arquitectura evaluada

La evaluación se realizó sobre el entorno académico QA de TechBank Operations Center, publicado en Azure Container Apps. La aplicación es un único contenedor Node.js que sirve la SPA React y la API Express. La imagen desplegada es `acrtechbanks7brazilsouth.azurecr.io/techbank:8f60360a51aac04dbf4425a6c7584a40bec274e8`, obtenida desde Azure Container Registry por el pipeline v1.1.0.

La Container App `ca-techbank-s7-qa`, dentro de `cae-techbank-s7-qa` en Brazil South, estaba en estado `Succeeded`, `Running` y `Healthy` al registrar la línea base. Su configuración real asigna 0.25 vCPU y 0.5 GiB de memoria por réplica. El escalado está acotado a un mínimo de una y un máximo de tres réplicas, por lo que el servicio mantiene una instancia disponible y puede distribuir tráfico en instancias adicionales dentro de ese límite.

## Prueba preparada

Se añadió `tests/load/k6-qa.js`, una prueba k6 moderada que exige `BASE_URL` y consulta `GET /health`, `GET /api/transactions` y `GET /api/metrics`. La secuencia dura aproximadamente un minuto: 10 segundos hasta 5 VUs, 20 segundos hasta 20 VUs, 20 segundos hasta 30 VUs y 10 segundos de descenso a cero. No es una prueba de estrés destructiva.

Los thresholds definidos son una tasa de fallos HTTP menor al 1 %, p95 menor a 1000 ms y más del 99 % de checks exitosos. La ejecución prevista es:

```bash
k6 run -e BASE_URL=https://ca-techbank-s7-qa.victoriousdesert-e29e6577.brazilsouth.azurecontainerapps.io tests/load/k6-qa.js
```

En esta estación k6 no está instalado, por lo que la prueba no fue ejecutada y no se instalaron herramientas ni se generó carga adicional. El comando anterior es el requerido para obtener la evidencia real cuando k6 esté disponible.

## Resultados observados

| Métrica                       | Resultado                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Requests totales              | No disponible: k6 no se ejecutó.                                                                             |
| Requests por segundo          | No disponible: k6 no se ejecutó.                                                                             |
| Latencia promedio             | No disponible: k6 no se ejecutó.                                                                             |
| Latencia p95                  | No disponible: k6 no se ejecutó.                                                                             |
| Tasa de error                 | No disponible: k6 no se ejecutó.                                                                             |
| Réplicas antes de la prueba   | 1 réplica activa.                                                                                            |
| Máximo de réplicas observado  | No disponible: no hubo ejecución de carga.                                                                   |
| Réplicas después de la prueba | No disponible: no hubo ejecución de carga.                                                                   |
| CPU y memoria observadas      | Configuración: 0.25 vCPU y 0.5 GiB por réplica; uso en tiempo real no disponible por CLI en esta evaluación. |

Por tanto, esta evidencia no afirma que se haya producido escalado horizontal. La única conclusión observable es que la revisión activa tenía una réplica saludable antes de la prueba.

## Escalabilidad vertical

La escalabilidad vertical incrementa CPU o memoria asignada a cada réplica. Para TechBank, elevar los 0.25 vCPU o 0.5 GiB podría reducir contención de recursos si una sola instancia está saturada. Es una intervención simple, pero conserva un límite físico por réplica y normalmente implica aplicar una nueva revisión; no sustituye la disponibilidad que brindan varias instancias.

## Escalabilidad horizontal y autoscaling

La escalabilidad horizontal aumenta el número de réplicas. Azure Container Apps está configurado con `minReplicas: 1` y `maxReplicas: 3`, de modo que puede sostener de una a tres instancias. La regla HTTP real se llama `http-scaler` y utiliza `concurrentRequests: 10`. Esto expresa un umbral explícito de concurrencia: si la concurrencia sostenida supera la capacidad objetivo, KEDA puede solicitar más réplicas, sin exceder tres.

La carga preparada alcanza hasta 30 VUs, pero VUs no equivalen automáticamente a 30 solicitudes concurrentes: las respuestas rápidas y la pausa de 0.5 segundos pueden mantener la concurrencia efectiva bajo el umbral de 10. Si una ejecución real no incrementa réplicas, la explicación técnica sería esa concurrencia insuficiente, no una ausencia de configuración de autoscaling. El ajuste mínimo a evaluar —sin aplicarlo en esta fase— sería reducir el umbral `concurrentRequests` o aumentar cuidadosamente la concurrencia sostenida de la prueba, siempre preservando límites académicos y control de costo.

## Conclusión técnica

QA cuenta con una configuración de escalabilidad horizontal verificable, limitada y adecuada para el laboratorio: una réplica base, máximo tres y una regla HTTP explícita. Aún faltan resultados k6 y observación de réplicas durante una ejecución para demostrar empíricamente el escalado. El informe separa esa limitación de los datos reales ya disponibles y evita atribuir métricas o comportamiento no medidos.
