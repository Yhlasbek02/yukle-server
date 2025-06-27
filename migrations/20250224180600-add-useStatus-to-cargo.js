'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Cargos', 'useStatus', {
      type: Sequelize.BOOLEAN,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Cargos', 'useStatus');
  }
};
