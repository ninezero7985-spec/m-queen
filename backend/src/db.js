const bcrypt = require('bcryptjs')

const users = [
  {
    id: 1,
    full_name: 'Admin',
    email: 'admin@mqueen.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  }
]

module.exports = users