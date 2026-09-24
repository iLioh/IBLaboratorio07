import { app } from './app.js';
import { environment } from './config/environment.js';

app.listen(environment.port, '0.0.0.0', () => {
  process.stdout.write(
    `TechBank API listening on http://0.0.0.0:${environment.port} (${environment.environment})\n`,
  );
});
