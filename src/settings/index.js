import development from './development.json';
import production from './production.json';
import staging from './staging.json';
import demo from './demo.json';

export const env = process.env.NODE_ENV || 'development';

const settings = {
  development,
  production,
  staging,
  demo,
}[env];

export default settings;
