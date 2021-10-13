import development from './development';
import production from './production';
import staging from './staging';
import demo from './demo';
import test from './test';

export const env = process.env.NODE_ENV || 'development';

const settings = {
  development,
  production,
  staging,
  demo,
  test,
}[env];

export default settings;
