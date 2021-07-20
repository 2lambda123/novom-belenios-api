import development from '../settings/development';
import production from '../settings/production';

export const env = process.env.NODE_ENV || 'development';

const settings = {
  development,
  production,
}[env];

export default settings;
