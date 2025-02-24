const {country, city} = require("../../models/models");
const {Op} = require("sequelize");

class CountryController {
    async addCountry (req, res) {
        try {
            const {nameEn, nameRu, nameTr, nameTm} = req.body;
            const countryData = await country.findOne({where: {nameEn: nameEn}});
            if (countryData) {
                return res.status(404).json({message: "Country already exist"});
            }
            const newCountry = await country.create({nameEn, nameRu, nameTr, nameTm});
            res.status(200).json({message: "Country added", newCountry});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error in adding country'});
        }
    }
    async getCountry (req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.pageSize || 7;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const {searchKey} = req.query;
            let queryOptions = {
                limit: parseInt(limit),
                offset,
                order: [['id', 'ASC']]
            };
            if (searchKey) {
                queryOptions.where = {
                    [Op.or]: [
                        { nameEn: { [Op.iLike]: `%${searchKey}%` } },
                        { nameRu: { [Op.iLike]: `%${searchKey}%` } },
                        { nameTr: { [Op.iLike]: `%${searchKey}%` } },
                    ]
                };
            }
            const { count, rows: countries } = await country.findAndCountAll(queryOptions);
            const totalPages = Math.ceil(count / parseInt(limit));
            res.status(200).json({
                countries,
                totalPages,
                totalCountry: count,
                currentPage: page
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error in getting countries'});
        }
    }

    async deleteCountry (req, res) {
        try {
            const {id} = req.params;
            const countryData = await country.findOne({where: {uuid: id}});
            if (!countryData) {
                return res.status(404).json({message: "Country not found"});
            }
            const cities = await city.findAll({where: {
                countryId: countryData.id
            }});
            for (const city of cities) {
                await city.destroy();
            }
            await countryData.destroy();
            
            res.status(200).json({message: "Country deleted successfully"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in deleting country"});
        }
    }

    async editCountry (req, res) {
        try {
            const {id} = req.params;
            const {nameEn, nameRu, nameTr, nameTm} = req.body;
            const countryData = await country.findOne({where: {uuid: id}});
            if (!countryData) {
                return res.status(404).json({message: "Country not found"});
            }
            countryData.nameEn = nameEn;
            countryData.nameRu = nameRu;
            countryData.nameTr = nameTr;
            countryData.nameTm = nameTm;
            await countryData.save();
            res.status(200).json({message: "Country edited successfully"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in editing country"});
        }
    }

    async getCities (req, res) {
        try {
            const id = req.query.country;
            const page = req.query.page || 1;
            const limit = Math.max(req.query.pageSize || 8, 1);
            const offset = Math.max((parseInt(page) - 1) * parseInt(limit), 0);
            const {searchKey} = req.query;
            let queryOptions = {
                limit: parseInt(limit),
                offset,
                include: [{
                    model: country,
                    as: 'country'

                }],
                order: [
                    ['id', 'ASC']
                ]
            };
            if (id) {
                const Country = await country.findOne({where: {uuid: id}});
                if (searchKey) {
                    queryOptions.where = {
                        countryId: Country.id,
                        [Op.or]: [
                            { nameEn: { [Op.iLike]: `%${searchKey}%` } },
                            { nameRu: { [Op.iLike]: `%${searchKey}%` } },
                            { nameTr: { [Op.iLike]: `%${searchKey}%` } },
                        ]
                    };
                } else {
                    queryOptions.where = {
                        countryId: Country.id,
                    }
                }
            } else {
                if (searchKey) {
                    queryOptions.where = {
                        [Op.or]: [
                            { nameEn: { [Op.iLike]: `%${searchKey}%` } },
                            { nameRu: { [Op.iLike]: `%${searchKey}%` } },
                            { nameTr: { [Op.iLike]: `%${searchKey}%` } },
                        ]
                    };
                }
            }
            
            const { count, rows: cities } = await city.findAndCountAll(queryOptions);
            const totalPages = Math.ceil(count / parseInt(limit));
            res.status(200).json({
                cities,
                totalPages,
                totalCities: count,
                currentPage: page
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting city"});
        }
    }

    async addCity (req, res) {
        try {
            const {nameEn, nameRu, nameTr, nameTm, countryId} = req.body;
            console.log(req.body);
            const newCity = await city.create({
                nameEn, nameRu, nameTr, nameTm, countryId
            });
            
            res.status(200).json({message: 'City successfully added', newCity});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in adding city"});
        }
    }

    async editCity (req, res) {
        try {
            const {id} = req.params;
            const {nameEn, nameRu, nameTr, nameTm, countryId} = req.body;
            const City = await city.findOne({where: {uuid: id}});
            if (!City) {
                return res.status(404).json({message: "Not found"});
            }
            City.nameEn = nameEn;
            City.nameRu = nameRu;
            City.nameTr = nameTr;
            City.nameTm = nameTm;
            City.countryId = countryId;
            await City.save();
            res.status(200).json({message: "City updated", city});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in editing city"});
        }
    }

    async deleteCity (req, res) {
        try {
            const {id} = req.params;
            const cityData = await city.findOne({where: {uuid: id}});
            if (!cityData) {
                return res.status(404).json({message: "City not found"});
            }
            await cityData.destroy();
            res.status(200).json({message: "City deleted successfully"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in deleting city"});
        }
    }
}

module.exports = CountryController;