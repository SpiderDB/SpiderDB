var path = require('path');

module.exports = {
  entry: './compiled/spiderDB.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'spiderDB.js'
  }
}
