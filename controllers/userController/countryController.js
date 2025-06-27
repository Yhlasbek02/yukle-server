const { country, city } = require("../../models/models");
const { Op, Sequelize } = require("sequelize");
class countryController {
    async getCountries(req, res) {
        function toCamelCase(name) {
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
        try {
            const { lang } = req.params;
            const { searchKey } = req.query;

            let whereClauses = {};
            if (searchKey) {
                if (['en', 'ru', 'tr', 'tm'].includes(lang)) {
                    whereClauses[lang] = {
                        [`name${toCamelCase(lang)}`]: { [Op.iLike]: `%${searchKey}%` },
                    };
                } else {
                    console.error(`Invalid language code: ${lang}`);
                    return res.status(400).json({ message: 'Invalid language code' });
                }
            }

            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
            };

            const orderColumn = {
                en: Sequelize.col('nameEn'),
                ru: Sequelize.col('nameRu'),
                tr: Sequelize.col('nameTr'),
                tm: Sequelize.col('nameTr'), 
            };

            const countries = await country.findAll({
                attributes: attributes[lang] || {},
                where: whereClauses[lang] || {},
                order: [[orderColumn[lang] || Sequelize.col('nameEn'), 'ASC']],
            });

            if (!countries || countries.length === 0) {
                return res.status(404).json({ message: 'Countries not found' });
            }

            return res.status(200).json({ countries });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error in getting countries' });
        }
    }



    async getCities(req, res) {
        function toCamelCase(name) {
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
        try {
            const { countryId, lang } = req.params;
            const { searchKey } = req.query;

            const countryExist = await country.findOne({ where: { id: countryId } });
            if (!countryExist) {
                return res.status(404).json({ message: 'Country not found' });
            }

            let whereClauses = {};

            if (searchKey) {
                if (['en', 'ru', 'tr', 'tm'].includes(lang)) {
                    const nameProperty = `name${toCamelCase(lang)}`;
                    whereClauses = {
                        [nameProperty]: { [Op.iLike]: `%${searchKey}%` },
                        countryId: countryExist.id,
                    };
                } else {
                    return res.status(400).json({ message: 'Invalid language code' });
                }
            } else {
                whereClauses = {
                    countryId: countryExist.id,
                };
            }


            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
            };

            const orderByColumn = {
                en: Sequelize.col('nameEn'),
                ru: Sequelize.col('nameRu'),
                tr: Sequelize.col('nameTr'),
                tm: Sequelize.col('nameTr'),
            };

            let cities = await city.findAll({
                where: whereClauses,
                attributes: attributes[lang] || {},
                order: [[orderByColumn[lang] || Sequelize.col('nameEn'), 'ASC']],
            });

            if (cities.length === 0) {
                return res.status(200).json({ cities: [] });
            }

            res.status(200).json({ cities });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error in getting cities' });
        }
    }
}

module.exports = countryController;