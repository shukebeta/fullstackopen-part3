const express = require('express')
const app = express()
const morgan = require('morgan')

morgan.token('post-data', (req) => req.method === 'POST' ? JSON.stringify(req.body) : '')

app.use(express.json())
app.use(
  morgan(':method :url :status :response-time :post-data')
)

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456",
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345",
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
  },
]

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people </p> ${new Date()}`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = +request.params.id
  const person = persons.find(_ => _.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})
app.delete('/api/persons/:id', (request, response) => {
  const id = +request.params.id
  const person = persons.find(_ => _.id === id)
  if (person) {
    persons = persons.filter(_ => _.id !== id)
  }
  response.status(204).end()
})

app.post('/api/person', (request, response) => {
  const person = {...request.body}
  if (!person) {
    response.status(400).json({
      error: 'no person data received.'
    })
  } else if (!person.name) {
    response.status(400).json({
      error: 'name cannot be empty.'
    })
  } else if (!person.number) {
    response.status(400).json({
      error: 'number cannot be empty.'
    })
  } else if (persons.find(_ => _.name.toLowerCase() === person.name.trim().toLowerCase())) {
    response.status(400).json({
      error: 'name must be unique.'
    })
  } else {
    const min = 1000
    const max = Number.MAX_SAFE_INTEGER
    person.id = Math.floor(Math.random() * (max - min + 1) ) + min
    persons.push(person)
    response.json(person)
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
