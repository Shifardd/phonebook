const mongoose = require('mongoose')

if(process.argv.length < 3) {
  console.log('1.give password \nor \n2.give password, contact name, and contact number as argument');
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://phonebook:${password}@cluster0.oeoqpde.mongodb.net/Phonebook?appName=Cluster0`

mongoose.set("strictQuery", false)

mongoose.connect(url, {family: 4})

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: process.argv[3],
  number: process.argv[4]
})

if(process.argv.length === 5) {
  person.save().then(result => {
    console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`);
    mongoose.connection.close()
  })
} else if(process.argv.length === 3) {
  Person.find({}).then(result => {
    console.log("phonebook:");
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close()
  })
}

