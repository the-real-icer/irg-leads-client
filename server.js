import express from 'express';
import helmet from 'helmet';
import next from 'next';
import compression from 'compression';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { config } from 'dotenv';
// import { parse } from 'url';

config(); // Load .env variables

const port = parseInt(process.env.PORT, 10) || 2000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const nextHandler = app.getRequestHandler();

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:4000';

// Validate ALLOWED_ORIGIN
if (!allowedOrigin) {
    console.error('ALLOWED_ORIGIN is not defined in .env');
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
                              styleSrc: ["'self'", "'unsafe-inline'"], // Adjust based on your app
                              scriptSrc: ["'self'", 'https://accounts.google.com'], // For Google Sign-In
                              connectSrc: ["'self'", allowedOrigin], // Allow backend API
                              imgSrc: ["'self'", 'data:', 'https:'], // Allow images
                          },
                      },
                hsts: { maxAge: 31536000, includeSubDomains: true }, // Enable HSTS
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
        // server.all('/:path*', (req, res) => {
        //     const parsedUrl = parse(req.url, true);
        //     return handle(req, res, parsedUrl);
        // });
        // Error handling middleware
        server.use((err, req, res) => {
            req.logger.error(err.stack);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        });

        server.listen(port, () => {
            console.log(`> Server ready on http://localhost:${port}`);
            console.log(`> CORS allowed for: ${allowedOrigin}`);
        });
    })
    .catch((err) => {
        console.error('Failed to start server:', err.stack);
        process.exit(1);
    });
