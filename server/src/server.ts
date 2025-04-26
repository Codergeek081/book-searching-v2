import express from 'express';
import {expressMiddleware} from '@apollo/server/express4';

import { ApolloServer } from '@apollo/server';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';
import db from './config/connection.js';
import routes from './routes/index.js';
import cors from 'cors';
import { authenticateToken } from './services/auth.js';
import path from 'path';
import type { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.resolve();

const server = new ApolloServer({
typeDefs,
resolvers,
});

await server.start();

app.use(cors())

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  '/graphql',
  authenticateToken,
  expressMiddleware(server, {
    context: async ({ req }) => ({
      user: req.user,
    }),
  })
);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (_: Request, res: Response) =>
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  );
}

app.use(routes);

db.once('open', () => {
app.listen(PORT, () => console.log(`🌍 Now listening on http://localhost:${PORT}`))
})