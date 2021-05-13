require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const fs = require('fs')
const marked = require('marked')
const api = require('./models/personApi')

morgan.token('post-data', (req) => req.method === 'POST' ? JSON.stringify(req.body) : '')

app.use(express.json())
app.use(
  morgan(':method :url :status :response-time :post-data'),
)
app.use(cors())
app.use(express.static('build'))

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people </p> ${new Date()}`)
})

app.get('/api/persons', async (request, response) => {
  const persons = await api.fetchAll()
  response.json(persons)
})

app.get('/api/persons/:id', async(request, response) => {
  const id = request.params.id.trim()
  const persons = await api.fetchAll()
  const person = persons.find(_ => _.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})
app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id.trim()
  const person = persons.find(_ => _.id === id)
  if (person) {
    persons = persons.filter(_ => _.id !== id)
  }
  response.status(204).end()
})

app.post('/api/persons', async (request, response) => {
  const person = {...request.body}
  const persons = await api.fetchAll()
  if (!person) {
    response.status(400).json({
      error: 'no person data received.',
    })
  } else if (!person.name) {
    response.status(400).json({
      error: 'name cannot be empty.',
    })
  } else if (!person.number) {
    response.status(400).json({
      error: 'number cannot be empty.',
    })
  } else if (persons.find(_ => _.name.toLowerCase() === person.name.trim().toLowerCase())) {
    response.status(400).json({
      error: 'name must be unique.',
    })
  } else {
    const newPerson = await api.addPerson(person)
    response.json(newPerson)
  }
})

app.get('/readme.md', function (req, res) {
  var path = __dirname + '/README.MD'
  var file = fs.readFileSync(path, 'utf8')
  res.send(marked(file.toString()))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
