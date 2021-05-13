const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const username = 'fullstack-open'
const database = 'fullstackopen'

const url =
  `mongodb+srv://${username}:${password}@cluster0.tmwfl.mongodb.net/${database}?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// add new person
if (process.argv[3]) {
  const name = process.argv[3].trim()
  const number = process.argv[4] && process.argv[4].trim() || ''
  if (!number) {
    console.log('If you want to add a person, please run: node mongo.js <password> <name> <number>')
    process.exit(1)
  }

  const person = new Person({
    name,
    number,
  })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  // list all
  Person.find({}).then(
    _ => {
      console.log('phonebook:')
      for (const person of _) {
        console.log(`${person.name.trim()} ${person.number.trim()}`)
      }
      mongoose.connection.close()
      process.exit(0)
    }
  )
}

