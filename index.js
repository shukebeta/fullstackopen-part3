require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const fs = require('fs')
const marked = require('marked')
const api = require('./models/personApi')
// the following wrap function is from https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/
const wrap = fn => (...args) => fn(...args).catch(args[2])

morgan.token('post-data', (req) => req.method === 'POST' || req.method === 'PUT' ? JSON.stringify(req.body) : '')
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
const requestLogger = morgan(':method :url :status :response-time :post-data')
app.use(requestLogger)

app.get('/info', async (request, response) => {
  const count = await api.Person.estimatedDocumentCount()
  response.send(`<p>Phonebook has info for ${count} people </p> ${new Date()}`)
})

app.get('/api/persons', async (request, response) => {
  const persons = await api.fetchAll()
  response.json(persons)
})

app.get('/api/persons/:id', wrap(async (request, response) => {
  const id = request.params.id.trim()
  const person = await api.findById(id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
}))
app.delete('/api/persons/:id', wrap(async (request, response) => {
  const id = request.params.id.trim()
  await api.delById(id)
  response.status(204).end()
}))

app.put('/api/persons/:id', wrap(async (request, response) => {
  const id = request.params.id.trim()
  const person = request.body
  if (!person.name) {
    throw new Error('name cannot be empty.')
  } else if (!person.number) {
    throw new Error('number cannot be empty.')
  } else {
      const newPerson = await api.update(id, person)
      response.json(newPerson)
  }
}))

app.post('/api/persons', wrap(async (request, response) => {
  const person = {...request.body}
  if (!person.name) {
    throw new Error('name cannot be empty.')
  } else if (!person.number) {
    throw new Error('number cannot be empty.')
  } else {
    const persons = await api.fetchAll()
    if (persons.find(_ => _.name.toLowerCase() === person.name.trim().toLowerCase())) {
      throw new Error('name must be unique.')
    } else {
      const newPerson = await api.addPerson(person)
      response.json(newPerson)
    }
  }
}))

app.get('/readme.md', function (req, res) {
  var path = __dirname + '/README.MD'
  var file = fs.readFileSync(path, 'utf8')
  res.send(marked(file.toString()))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

// error handling middleware has to be the last loaded middleware!!!
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({error: `malformatted id: ${error.value}`})
  }
  return response.status(400).send({error: error.message})
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
