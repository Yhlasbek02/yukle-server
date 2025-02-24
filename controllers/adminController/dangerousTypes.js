const { DangerousType } = require("../../models/models");

class DangerousTypeController {
    async add(req, res) {
        try {
            const { nameEn, nameRu, nameTr, nameTm } = req.body;
            const type = await DangerousType.create({ nameEn, nameRu, nameTr, nameTm });
            res.status(200).json({ message: "Type added sucessfully", type });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to add type" });
        }
    }

    async edit(req, res) {
        try {
            const { id } = req.params;
            const { nameEn, nameRu, nameTr, nameTm } = req.body;
            const type = await DangerousType.findOne({ where: { uuid: id } });
            if (!type) {
                return res.status(404).json({ message: "Type not found" });
            }
            type.nameEn = nameEn;
            type.nameRu = nameRu;
            type.nameTr = nameTr;
            type.nameTm = nameTm
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
            const type = await DangerousType.findOne({ where: { uuid: id } });
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
            let queryOptions = {
                limit: parseInt(limit),
                offset,
                order: [['id', 'DESC']]
            };
            const { count, rows: types } = await DangerousType.findAndCountAll(queryOptions);
            const totalPages = Math.ceil(count / parseInt(limit));
            res.status(200).json({
                types,
                totalPages,
                totalTypes: count,
                currentPage:parseInt(page)
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to get types' });
        }
    }
}

module.exports = DangerousTypeController;