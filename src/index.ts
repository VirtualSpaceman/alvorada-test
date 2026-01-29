import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.server.nodeEnv}`);
  console.log(`🤖 OpenAI Model: ${config.openai.model}`);
});

export default app;
