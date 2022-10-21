// =================== packages ====================
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import passport from 'passport';
import path from 'path';
// ======================================================
import { NODE_ENV, PORT, LOG_FORMAT, JWT_SECRET } from '@config';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { TokenDataInterface } from './interfaces/user.interface';
import prismaObj from './middlewares/prisma.middleware';
import { VerifiedCallback } from 'passport-jwt';

const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tokenData: TokenDataInterface;
    }
  }
}

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public users = prismaObj.user;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.app.use(express.static(path.join(__dirname, '../public')));
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, './templates'));
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.initializePassport();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info('=================================');
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info('=================================');
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors());
    // this.app.use(cors({ origin: [FRONT_URL, 'http://localhost:3000'], credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  // ===================== routes ======================
  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializePassport() {
    const opts = {
      jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('jwt'),
      secretOrKey: JWT_SECRET,
    };

    passport.use(
      'jwt',
      new JWTStrategy(opts, async (JWTPayload: any, done: VerifiedCallback) => {
        try {
          const user = await this.users.findFirst({
            where: { email: JWTPayload.email },
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              verified: true,
            },
          });

          if (user) {
            done(null, user);
          } else {
            done(null, false);
          }
        } catch (err) {
          done(err);
        }
      }),
    );
    this.app.use(passport.initialize());
  }
}

export default App;
