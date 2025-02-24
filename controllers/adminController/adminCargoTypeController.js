const {CargoType} = require("../../models/models");

class CargoTypeController {
    async addCargoType (req, res) {
        try {
            const {nameEn, nameRu, nameTr, nameTm} = req.body;
            const cargoType = await CargoType.create({nameEn, nameRu, nameTr, nameTm});
            res.status(200).json({message: "Cargo type added sucessfully", cargoType});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Failed to add cargo type"});
        }
    }

    async editCargoType ( req, res) {
        try {
            const {id} = req.params;
            const {nameEn, nameRu, nameTr, nameTm} = req.body;
            const cargoType = await CargoType.findOne({where: {uuid: id}});
            if (!cargoType) {
                return res.status(404).json({message: "Cargo type not found"});
            }
            cargoType.nameEn = nameEn;
            cargoType.nameRu = nameRu;
            cargoType.nameTr = nameTr;
            cargoType.nameTm = nameTm;
            await cargoType.save();
            res.status(200).json({message: "Cargo type successfully edited", cargoType});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Failed to edit cargo type"});
        }
    }

    async deleteCargoType (req, res) {
        try {
            const {id} = req.params;
            const cargoType = await CargoType.findOne({where: {uuid: id}});
            if (!cargoType) {
                return res.status(404).json({message: "Cargo type not found"});
            }
            await cargoType.destroy();
            res.status(200).json({message: "Cargo type successfully deleted"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Failed to delete cargo type"});
        }
    }

    async getAllCargoType (req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.pageSize || 10;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            let queryOptions = {
                limit: parseInt(limit),
                offset,
                order: [['id', 'DESC']]
            };
            const { count, rows: cargoTypes } = await CargoType.findAndCountAll(queryOptions);
            const totalPages = Math.ceil(count / parseInt(limit));
            res.status(200).json({
                cargoTypes,
                totalPages,
                totalCargoTypes: count,
                currentPage: page
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Failed to get cargo types'});
        }
    }
}

module.exports = CargoTypeController;