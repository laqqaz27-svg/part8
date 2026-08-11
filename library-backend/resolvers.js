const { GraphQLError } = require('graphql')
const Book = require('./models/book')
const Author = require('./models/author')

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
  },

  Book: {
    author: async (root) => {
      return Author.findOne({
        name: root.author
      })
    },
  },

  Author: {
    bookCount: async (root) => {
      return Book.countDocuments({
        author: root.name
      })
    },
  },

  Mutation: {
   addBook: async (root, args) => {
  try {
    let author = await Author.findOne({
      name: args.author
    })

    if (!author) {
      author = new Author({
        name: args.author
      })
    }

    const book = new Book({
      title: args.title,
      published: args.published,
      author: args.author,
      genres: args.genres
    })

    await author.validate()
    await book.validate()

    if (author.isNew) {
      await author.save()
    }

    await book.save()

    return book
  } catch (error) {
    throw new GraphQLError(`Adding book failed: ${error.message}`, {
      extensions: {
        code: 'BAD_USER_INPUT',
        invalidArgs: args
      }
    })
  }
},

    editAuthor: async (root, args) => {
      const author = await Author.findOne({
        name: args.name
      })

      if (!author) {
        return null
      }

      author.born = args.setBornTo

      await author.save()

      return author
    },
  },
}

module.exports = resolvers