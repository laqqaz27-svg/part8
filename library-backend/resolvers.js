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

    allBooks: async () => {
      return Book.find({})
    },

    allAuthors: async () => {
      return Author.find({})
    },
  },

  Author: {
    bookCount: async (root) => {
      const books = await Book.find({
        author: root.name,
      })

      return books.length
    },
  },

  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({
        name: args.author,
      })

      if (!author) {
        author = new Author({
          name: args.author,
        })

        await author.save()
      }

      const book = new Book({
        title: args.title,
        published: args.published,
        author: args.author,
        genres: args.genres,
      })

      await book.save()

      return book
    },

    editAuthor: async (root, args) => {
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
  },
}

module.exports = resolvers