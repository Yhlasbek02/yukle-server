// module.exports = {
//   development: {
//     username: 'market',
//     password: '+kurT%yB?<aN8]st',
//     database: 'yukle',
//     host: 'localhost',
//     dialect: 'postgres',
//     logging: console.log,
//   },
//   test: {
//     username: 'postgres',
//     password: '+kurT%yB?<aN8]st',
//     database: 'yukle',
//     host: 'localhost',
//     dialect: 'postgres',
//     logging: false,
//   },
//   production: {
//     username: 'market',
//     password: '+kurT%yB?<aN8]st',
//     database: 'yukle',
//     host: 'localhost',
//     dialect: 'postgres',
//     logging: false,
//   },
// };


const Sequelize = require('sequelize');

const sequelize = new Sequelize('yukledb', 'postgres', '0104', {
  dialect: 'postgres',
  host: 'localhost',
});

module.exports = sequelize;
