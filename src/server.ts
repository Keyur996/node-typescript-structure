import App from '@/app';
import IndexRoute from '@routes/index.route';
import validateEnv from '@utils/validateEnv';
import AuthRoute from './routes/auth.route';
import OrganizationRoute from './routes/organization.route';
import PlatformRoute from './routes/platform.route';
import ProfileRoute from './routes/profile-permission.route';
import UserRoute from './routes/user.route';

validateEnv();

const app = new App([
  new IndexRoute(),
  new AuthRoute(),
  new UserRoute(),
  new ProfileRoute(),
  new PlatformRoute(),
  new OrganizationRoute(),
]);

app.listen();
