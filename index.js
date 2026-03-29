const express = require('express')
const morgan = require('morgan')

const app = express()

morgan.token("reqBody", (req, res) => {
  if(req.method === "POST") {
    return JSON.stringify(req.body)
  } 
  return " "
})

app.use(express.json())
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
  res.json(data)
})

app.get('/info', (req, res) => {
  const date = new Date().toString()
  res.send(`<p>Phonebook has info for ${data.length} people </p>
    <p> ${date}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const person = data.find(p => p.id === id)
  if(person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  data = data.filter(p => p.id !== id)
  res.status(204).end()
})

const generateId = () => {
  const randomId = Math.floor(Math.random() * 10000) + 1
  return String(randomId)
}

app.post('/api/persons', (req, res) => {
  const body = req.body
  
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number is missing'
    })
  }
  let allNames = data.map(person => person.name)
  if(allNames.includes(body.name)) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  const newPerson = {
    name: body.name,
    number: body.number,
    id: generateId()
  }
  data = data.concat(newPerson)
  res.json(newPerson)
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({error: "unknown endpoint"})
}
app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
})