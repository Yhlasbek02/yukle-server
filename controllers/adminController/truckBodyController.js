const { TruckBody, TransportType } = require("../../models/models");
const Sequelize = require("sequelize")
class TruckBodyController {
    async add(req, res) {
        try {
            const { nameEn, nameRu, nameTr, nameTm, transportTypeId } = req.body;
            const type = await TruckBody.create({ nameEn, nameRu, nameTr, nameTm, transportTypeId });
            res.status(200).json({ message: "Type added sucessfully", type });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to add type" });
        }
    }

    async edit(req, res) {
        try {
            const { id } = req.params;
            const { nameEn, nameRu, nameTr, nameTm, transportTypeId } = req.body;
            const type = await TruckBody.findOne({ where: { uuid: id } });
            if (!type) {
                return res.status(404).json({ message: "Type not found" });
            }
            type.nameEn = nameEn;
            type.nameRu = nameRu;
            type.nameTr = nameTr;
            type.nameTm = nameTm;
            type.transportTypeId = transportTypeId;
            await type.save();
            res.status(200).json({ message: "Type successfully edited", type });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to edit" });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const type = await TruckBody.findOne({ where: { uuid: id } });
            if (!type) {
                return res.status(404).json({ message: "type not found" });
            }
            await type.destroy();
            res.status(200).json({ message: "type successfully deleted" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to delete" });
        }
    }

    async getAllType(req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.pageSize || 10;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const types = await TruckBody.findAll({
                limit: parseInt(limit),
                offset,
                include: [
                    {
                        model: TransportType,
                        as: 'transportType',
                        attributes: ['id', 'nameEn']
                    }
                ],
                order: [
                    [Sequelize.literal(`"transportType"."nameEn"`), 'ASC'], // Order by transport type name alphabetically
                    ['id', 'DESC'] // Then order by ID descending
                ]
            });

            const count = await TruckBody.count();

            const totalPages = Math.ceil(count / parseInt(limit));

            res.status(200).json({
                types,
                totalPages,
                totalTypes: count,
                currentPage: parseInt(page)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to get types' });
        }
    }

}


module.exports = TruckBodyController;