require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/persons')


const app = express()

app.use(express.static('dist'))
app.use(express.json())

morgan.token('reqBody', (req) => {
  if(req.method === 'POST') {
    return JSON.stringify(req.body)
  } return ' '
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqBody'))

app.get('/', (req, res) => {
  res.end('Hello World')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(person => {
    res.json(person)
  })
})

app.get('/info', (req, res) => {
  const date = new Date().toString()
  Person.find({}).then(person => {
    const numberOfPerson = person.length
    res.send(`<p>Phonebook has info for ${numberOfPerson} people </p>
    <p> ${date}</p>`)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if(person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number is missing'
    })
  }


  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })
  newPerson.save()
    .then(person => {
      res.json(person)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findById(req.params.id)
    .then(person => {
      if(!person) {
        return res.status(404).end()
      }
      person.name = name
      person.number = number

      return person.save().then(savedPerson => {
        res.json(savedPerson)
      })

    })
    .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if(error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})