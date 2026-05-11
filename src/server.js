require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { connect: connectRabbit } = require('./events/connection');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerDocument = YAML.load('./swagger.yaml');
if (process.env.SERVER_URL) {
  swaggerDocument.servers = [{ url: `${process.env.SERVER_URL}/api`, description: 'Servidor atual' }];
}
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', routes);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AuthService rodando na porta ${PORT}`);
  console.log(`Documentação Swagger: http://localhost:${PORT}/api-docs`);
});

connectRabbit()
  .then(() => console.log('[MS1] RabbitMQ publisher conectado'))
  .catch((err) => console.error('[MS1] Falha ao conectar RabbitMQ:', err.message));