const Person = require('./person')

const api = {
  Person,
  async fetchAll() {
    return await Person.find({})
  },

  async addPerson(person) {
    const newPerson = new Person(person)
    return await newPerson.save()
  },

  async findById(id) {
    return await Person.findById(id)
  },

  async delById(_id) {
    return await Person.deleteOne({
      _id,
    })
  },

  async update(id, person) {
    return await Person.findByIdAndUpdate(id, person, {runValidators: true, context: 'query'})
  },
}

module.exports = api
