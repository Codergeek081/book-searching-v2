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
  express.json(),
  authenticateToken,
  expressMiddleware(server, {
    context: async ({ req }) => ({
      user: req.user,
    }),
  })
);

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(process.cwd(), 'client', 'dist');
  app.use(express.static(clientDist));
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('/*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(routes);

db.once('open', () => {
app.listen(PORT, () => console.log(`🌍 Now listening on http://localhost:${PORT}`))
})