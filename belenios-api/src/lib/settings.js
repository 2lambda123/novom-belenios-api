import demo from '../settings/demo';
import development from '../settings/development';
import production from '../settings/production';
import staging from '../settings/staging';

export const env = process.env.NODE_ENV || 'development';

const settings = {
  demo,
  development,
  production,
  staging,
}[env];

export default settings;
