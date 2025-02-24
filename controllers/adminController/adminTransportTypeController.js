const {TransportType} = require("../../models/models");

class TransportTypeController {
    async addTransportType (req, res) {
        try {
            const {nameEn, nameRu, nameTr, nameTm} = req.body;
            if (!nameEn || !nameRu || !nameTr || !nameTm) {
                return res.status(400).json({message: "All fields are required"});
            }
            const newTransportType = await TransportType.create({nameEn, nameRu, nameTr, nameTm});
            res.status(200).json({message: "Transport type added", newTransportType});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Failed to add transport type"});
        }
    }

    async editTransportType (req, res) {
        try {
            const {id} = req.params;
            const {nameEn, nameRu, nameTr, nameTm} = req.body;
            const transportType = await TransportType.findOne({where: {uuid: id}});
            if (!transportType) {
                return res.status(404).json({message: "Transport type not found"});
            }
            transportType.nameEn = nameEn;
            transportType.nameRu = nameRu;
            transportType.nameTr = nameTr;
            transportType.nameTm = nameTm;
            await transportType.save();
            res.status(200).json({message: "Transport type edited successfully", transportType});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Failed to edit transport type"});
        }
    }

    async deleteTransportType (req, res) {
        try {
            const {id} = req.params;
            const transportType = await TransportType.findOne({where: {uuid: id}});
            if (!transportType) {
                return res.status(404).json({message: "Transport type not found"});
            }
            await transportType.destroy();
            res.status(200).json({message: "Transport type successfully deleted"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Failed to delete transport type"});
        }
    }

    async getAllTransportType (req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.pageSize || 8;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            let queryOptions = {
                limit: parseInt(limit),
                offset,
                order: [['id', 'DESC']]
            };
            const { count, rows: transportTypes } = await TransportType.findAndCountAll(queryOptions);
            const totalPages = Math.ceil(count / parseInt(limit));
            res.status(200).json({
                transportTypes,
                totalPages,
                totalTransportTypes: count,
                currentPage: page
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Failed to get transport types'});
        }
    }
}

module.exports = TransportTypeController;