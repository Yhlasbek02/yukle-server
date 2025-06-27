'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Transport', 'useStatus', {
      type: Sequelize.BOOLEAN,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Cargos', 'useStatus');
  }
};
