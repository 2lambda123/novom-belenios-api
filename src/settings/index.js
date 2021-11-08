import development from './development';
import production from './production';
import staging from './staging';
import demo from './demo';

export const env = process.env.NODE_ENV || 'development';

const settings = {
  development,
  production,
  staging,
  demo,
}[env];

export default settings;
