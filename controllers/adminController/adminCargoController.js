const {Cargo, User, CargoType, country, city} = require("../../models/models");

class CargoController {
    async getCargos (req, res) {
        try {
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 6;
    
            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'ASC';
            let cargo = await Cargo.findAndCountAll({
                offset,
                limit: parseInt(pageSize),
                order: [[sort, sortOrder]],
                include: [
                    {
                        model: User,
                        as: "user"
                    },
                    {
                        model: CargoType,
                        as: "type"
                    },
                    {
                        model: country,
                        as: "from_country"
                    },
                    {
                        model: country,
                        as: "to_country"
                    },
                    {
                        model: city,
                        as: "from_city"
                    },
                    {
                        model: city,
                        as: "to_city"
                    }
                ]
            });
            let totalCargos = cargo.count;
            let cargos = cargo.rows;
            if (cargos.length === 0) {
                cargos = [];
            }
            res.status(200).json({
                cargos,
                totalCargos,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCargos / pageSize)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error in getting cargos'});
        }
    }

    async getCargo (req, res) {
        try {
            const {id} = req.params;
            const cargo = await Cargo.findOne({
                where: {uuid: id},
                include: [
                    {
                        model: User,
                        as: "user"
                    },
                    {
                        model: CargoType,
                        as: "type"
                    },
                    {
                        model: country,
                        as: "from_country"
                    },
                    {
                        model: country,
                        as: "to_country"
                    },
                    {
                        model: city,
                        as: "from_city"
                    },
                    {
                        model: city,
                        as: "to_city"
                    }
                ]
            });
            if (!cargo) {
                return res.status(404).json({message: "Cargo not found"});
            };
            res.status(200).json({cargo});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting cargo"});
        }
    }

    async deleteCargo (req, res) {
        try {
            const {id} = req.params;
            const cargo = await Cargo.findOne({where: {uuid: id}});
            if (!cargo) {
                return res.status(404).json({message: "Cargo not found"});
            };
            await cargo.destroy();
            res.status(200).json({message: "Cargo successfully deleted"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in deleting cargo"});
        }
    }
}

module.exports = CargoController;