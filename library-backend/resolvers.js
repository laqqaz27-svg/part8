const { GraphQLError } = require('graphql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const resolvers = {
  Query: {
    bookCount: async () => {
      return Book.countDocuments()
    },

    authorCount: async () => {
      return Author.countDocuments()
    },

    allBooks: async (root, args) => {
      const query = {}

      if (args.author) {
        query.author = args.author
      }

      if (args.genre) {
        query.genres = args.genre
      }

      return Book.find(query)
    },

    allAuthors: async () => {
      return Author.find({})
    },

    me: (root, args, context) => {
      return context.currentUser
    },
  },

  Book: {
    author: async (root) => {
      return Author.findOne({
        name: root.author,
      })
    },
  },

  Author: {
    bookCount: async (root) => {
      return Book.countDocuments({
        author: root.name,
      })
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        })
      }

      try {
        let author = await Author.findOne({
          name: args.author,
        })

        if (!author) {
          author = new Author({
            name: args.author,
          })
        }

        const book = new Book({
          title: args.title,
          published: args.published,
          author: args.author,
          genres: args.genres,
        })

        await author.validate()
        await book.validate()

        if (author.isNew) {
          await author.save()
        }

        await book.save()

        return book
      } catch (error) {
        throw new GraphQLError(
          `Adding book failed: ${error.message}`,
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args,
            },
          }
        )
      }
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        })
      }

      const author = await Author.findOne({
        name: args.name,
      })

      if (!author) {
        return null
      }

      author.born = args.setBornTo

      await author.save()

      return author
    },

    createUser: async (root, args) => {
      const passwordHash = await bcrypt.hash(args.password, 10)

      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
        passwordHash,
      })

      try {
        await user.save()
      } catch (error) {
        throw new GraphQLError(
          `Creating user failed: ${error.message}`,
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args,
            },
          }
        )
      }

      return user
    },

    login: async (root, args) => {
      const user = await User.findOne({
        username: args.username,
      })

      const passwordCorrect =
        user === null
          ? false
          : await bcrypt.compare(args.password, user.passwordHash)

      if (!user || !passwordCorrect) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return {
        value: jwt.sign(
          userForToken,
          process.env.JWT_SECRET
        ),
      }
    },
  },
}

module.exports = resolvers