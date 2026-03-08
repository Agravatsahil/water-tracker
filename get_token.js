const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ id: '69a432da8bba0d3558c78438' }, process.env.JWT_SECRET, { expiresIn: '1y' });
console.log(token);
