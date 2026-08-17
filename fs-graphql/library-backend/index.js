require('dotenv').config()

const http = require('http')
const mongoose = require('mongoose')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@as-integrations/express5')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/use/ws')
const { makeExecutableSchema } = require('@graphql-tools/schema')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const User = require('./models/user')

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const app = express()
const httpServer = http.createServer(app)

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
})

const serverCleanup = useServer(
  {
    schema,

    context: async () => {
      return {
        currentUser: null,
      }
    },
  },
  wsServer
)

const server = new ApolloServer({
  schema,

  plugins: [
    ApolloServerPluginDrainHttpServer({
      httpServer,
    }),

    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})

const start = async () => {
  await server.start()

  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization

        if (auth && auth.startsWith('Bearer ')) {
          const token = auth.substring(7)

          const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
          )

          const currentUser = await User.findById(
            decodedToken.id
          )

          return {
            currentUser,
          }
        }

        return {
          currentUser: null,
        }
      },
    })
  )

  httpServer.listen(4000, () => {
    console.log('Server ready at http://localhost:4000/graphql')
    console.log('WebSocket ready at ws://localhost:4000/graphql')
  })
}

start()