const Person = require('./person')

fetchAll = async () => {
  return await Person.find({})
}

addPerson = async (person) => {
  const newPerson = new Person(person)
  return await newPerson.save()
}

module.exports = {fetchAll, addPerson}
