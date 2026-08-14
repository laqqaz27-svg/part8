require('dotenv').config()
const mongoose = require('mongoose')
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const jwt = require('jsonwebtoken')

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

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },

  context: async ({ req }) => {
    const auth = req.headers.authorization

    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.substring(7)

      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET
      )

      const currentUser = await User.findById(decodedToken.id)

      return {
        currentUser,
      }
    }

    return {
      currentUser: null,
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})