require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/persons')


const app = express()

app.use(express.static('dist'))
app.use(express.json())

morgan.token("reqBody", (req, res) => {
  if(req.method === "POST") {
    return JSON.stringify(req.body)
  } 
  return " "
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqBody'))

let data = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

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
  // const id = req.params.id
  // const person = data.find(p => p.id === id)
  // if(person) {
  //   res.json(person)
  // } else {
  //   res.status(404).end()
  // }
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
  // const id = req.params.id
  // data = data.filter(p => p.id !== id)
  // res.status(204).end()
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

// const generateId = () => {
//   const randomId = Math.floor(Math.random() * 10000) + 1
//   return String(randomId)
// }

app.post('/api/persons', (req, res) => {
  const body = req.body
  
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number is missing'
    })
  }
  // let allNames = data.map(person => person.name)
  // if(allNames.includes(body.name)) {
  //   return res.status(400).json({
  //     error: 'name must be unique'
  //   })
  // }

  // const newPerson = {
  //   name: body.name,
  //   number: body.number,
  //   id: generateId()
  // }

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })
  newPerson.save().then(person => {
    res.json(person)
  })
  // data = data.concat(newPerson)
  // res.json(newPerson)
})

app.put('/api/persons/:id', (req, res, next) => {
  const {name, number} = req.body

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
  res.status(404).send({error: "unknown endpoint"})
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if(error.name === 'CastError') {
    return res.status(400).send({error: 'malformatted id'})
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
})