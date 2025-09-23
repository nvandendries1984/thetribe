// Moderation module initializer
import { registerModels } from './schema.js';
import routes from './routes.js';

export default function init(app, registerModel) {
  registerModels(registerModel);
  app.use('/api/moderation', routes);
}
