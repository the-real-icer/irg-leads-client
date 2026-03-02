import express from 'express';
import helmet from 'helmet';
import next from 'next';
import compression from 'compression';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { config } from 'dotenv';
config(); // Load .env variables

const port = parseInt(process.env.PORT, 10) || 2000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const nextHandler = app.getRequestHandler();

const allowedOrigin = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || 'http://localhost:4000';

// Validate ALLOWED_ORIGIN
if (!allowedOrigin) {
    console.error('ALLOWED_ORIGIN is not defined in .env'); // eslint-disable-line
    process.exit(1);
}

app.prepare()
    .then(() => {
        const server = express();

        // Security headers
        server.use(
            helmet({
                contentSecurityPolicy: dev
                    ? false // Disable CSP in dev for HMR
                    : {
                          directives: {
                              defaultSrc: ["'self'"],
                              scriptSrc: [
                                  "'self'",
                                  'https://accounts.google.com',
                                  'https://apis.google.com',
                                  "'unsafe-inline'",
                              ],
                              styleSrc: [
                                  "'self'",
                                  "'unsafe-inline'",
                                  'https://accounts.google.com',
                              ],
                              frameSrc: [
                                  'https://accounts.google.com',
                                  'https://content.googleapis.com',
                              ],
                              frameAncestors: ["'none'"],
                              connectSrc: [
                                  "'self'",
                                  allowedOrigin,
                                  'https://accounts.google.com',
                                  'https://oauth2.googleapis.com',
                                  'https://openidconnect.googleapis.com',
                                  'https://www.googleapis.com',
                              ],
                              imgSrc: [
                                  "'self'",
                                  'data:',
                                  'https:',
                                  'https://lh3.googleusercontent.com',
                              ],
                              fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                          },
                      },
                hsts: { maxAge: 31536000, includeSubDomains: true },
                xssFilter: true,
            }),
        );

        // CORS configuration
        server.use(
            cors({
                origin: allowedOrigin, // From .env or default to localhost:4000
                methods: ['GET', 'POST', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true, // If your app uses cookies/sessions
            }),
        );

        // Compression
        server.use(compression());

        // Logging
        server.use(pinoHttp({ level: dev ? 'debug' : 'info' }));

        // Handle Next.js API routes and pages
        server.use((req, res) => nextHandler(req, res));

        // Error handling middleware
        server.use((err, req, res) => {
            req.logger.error(err.stack);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        });

        server.listen(port, () => {
            console.log(`> Server ready on http://localhost:${port}`); // eslint-disable-line
            console.log(`> CORS allowed for: ${allowedOrigin}`); // eslint-disable-line
        });
    })
    .catch((err) => {
        console.error('Failed to start server:', err.stack); // eslint-disable-line
        process.exit(1);
    });
