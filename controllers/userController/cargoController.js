const { User, Cargo, CargoType, TransportType, country, city, Transport, Notifications, DangerousType } = require("../../models/models");
const { Op, Sequelize } = require("sequelize");
const {sendNotification} = require("../adminInitialize");
class CargoController {

    async getDangerousTypes(req, res) {
        try {
            const { lang } = req.params;
            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTm'), 'name']],
            };
            const types = await DangerousType.findAll({
                attributes: attributes[lang] || {}
            });
            if (!types || types.length === 0) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Cargo types not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Cargo types not found" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "Cargo types not found" });
                }
            }
            res.status(200).json({ types });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting dangerous types" });
        }
    }

    async getCargoTypes(req, res) {
        try {
            const { lang } = req.params;
            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTm'), 'name']],
            };
            const types = await CargoType.findAll({
                attributes: attributes[lang] || {}
            });
            if (!types || types.length === 0) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Cargo types not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Cargo types not found" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "Cargo types not found" });
                }
            }
            res.status(200).json({ types });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting cargo types" });
        }
    }




    async addCargo(req, res) {
        async function sendNotificationsAfterResponse(tokens, uuid, type, locationCountry) {
            const notificationPromises = tokens.map((token) =>
                sendNotification(token, `New cargo added`, locationCountry, `${uuid}`, type, locationCountry)
            );

            try {
                await Promise.all(notificationPromises);
                console.log("Notifications sent successfully");
            } catch (error) {
                console.error("Notification error:", error);
            }
        }
        try {
            const { lang } = req.params;
            const {
                typeId,
                cargoName,
                dangerousTypes,
                volume,
                price,
                tradeable,
                departureDate,
                fromCountry,
                fromCity,
                toCountry,
                toCity,
                weight,
                typeTransport,
                phoneNumber,
                name,
                email,
                whatsApp,
                additional_info
            } = req.body;

            if (!typeId || !fromCity || !fromCountry || !toCountry || !toCity || !name) {
                if (!phoneNumber && !email) {
                    if (lang === "en") {
                        return res.status(409).json({ message: "Fields are required" });
                    } if (lang === "ru") {
                        return res.status(409).json({ message: "Fields are required" });
                    } if (lang === "tr" || lang === "tm") {
                        return res.status(409).json({ message: "Fields are required" });
                    }
                }
            }
            const userId = req.user.id;
            const newCargo = await Cargo.create({
                typeId: typeId,
                fromCountry: fromCountry,
                fromCity: fromCity,
                toCountry: toCountry,
                toCity: toCity,
                cargoName,
                dangerousTypes,
                volume,
                price,
                tradeable,
                departureDate,
                typeTransport,
                weight,
                phoneNumber,
                email,
                name,
                whatsApp: whatsApp,
                userId: userId,
                additional_info
            });
            console.log(req.body);
            const transports = await Transport.findAll({ where: { locationCountry: fromCountry, userId: { [Op.ne]: userId } } });
            const notificationTokens = [];
            const userIds = []

            for (const transport of transports) {
                const user = await User.findOne({ where: { id: transport.userId } });
                console.log("user:", user.dataValues);
                if (user.fcm_token && user.cargoNotification && !notificationTokens.includes(user.fcm_token)) {
                    userIds.push(user.id);
                    console.log("fcm_token:", user.fcm_token)
                    notificationTokens.push(user.fcm_token);
                    console.log("Added");
                } else {
                    console.log(`${user.email} has no fcm_token`);
                }
            }

            const fromCountryName = await country.findOne({ where: { id: fromCountry } });
            if (!fromCountryName) {
                return res.status(404).json({ message: "Not found" });
            }
            if (lang === "en") {
                res.status(200).json({ message: "Cargo added successfully", newCargo });
            } else if (lang === "ru") {
                res.status(200).json({ message: "Груз успешно добавлен", newCargo });
            } else if (lang === "tr" || lang === "tm") {
                res.status(200).json({ message: "Yük başarıyla eklendi", newCargo });
            }
            try {
                const notification = await Notifications.create({
                    userIds: userIds,
                    body: "New Cargo",
                    url: `cargo/${newCargo.uuid}`,
                    type: 'cargo'
                })
                await sendNotificationsAfterResponse(notificationTokens, `${newCargo.uuid}`, "cargo", fromCountryName.nameEn);
            } catch (error) {
                console.error(error);
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Cargo adding error" })
        }
    }

    async getCargos(req, res) {
        try {
            const { lang } = req.params;
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 20;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'DESC';
            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTm'), 'name']],
            };
            const filters = {
                typeId: req.query.type,
                fromCountry: req.query.from,
                toCountry: req.query.to,
                weight: req.query.weight && !isNaN(parseInt(req.query.weight)) ? { [Op.lte]: parseInt(req.query.weight) } : undefined,
            };

            if (req.query.departureDate) {
                filters.departureDate = {
                    [Op.like]: `%${req.query.departureDate}%` // Partial match for DD.MM.YYYY
                };
            }
            
            
            // Remove undefined or empty filters
            Object.keys(filters).forEach((key) => {
                if (filters[key] === undefined || filters[key] === "") {
                    delete filters[key];
                }
            });

            const totalCount = await Cargo.count({
                where: {
                    ...filters,
                    userId: {
                        [Op.ne]: req.user.id
                    }
                }
            });
            let cargos = await Cargo.findAll({
                offset,
                limit: parseInt(pageSize),
                where: {
                    ...filters,
                    userId: {
                        [Op.ne]: req.user.id
                    }
                },
                attributes: {
                    exclude: ['updatedAt', 'userId', 'typeId', 'fromCountry', 'fromCity', 'toCountry', 'toCity']
                },
                order: [[sort, sortOrder]],
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ['name', 'surname', 'email', 'phoneNumber']
                    },
                    {
                        model: CargoType,
                        as: "type",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "from_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "to_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "from_city",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "to_city",
                        attributes: attributes[lang]
                    }
                ]
            });
            for (const single of cargos) {
                let transportTypes = [];
                for (const typeId of single.typeTransport) {
                    const type = await TransportType.findByPk(typeId);
                    if (type) {
                        if (lang === "en") {
                            transportTypes.push(type.nameEn);
                        } if (lang === "ru") {
                            transportTypes.push(type.nameRu);
                        } if (lang === "tr" || lang === "tm") {
                            transportTypes.push(type.nameTr);
                        }
                    }
                }
                single.typeTransport = transportTypes;

                let dangerousTypes = [];
                for (const dangerousTypeId of single.dangerousTypes || []) {
                    const dangerousType = await DangerousType.findOne({ id: dangerousTypeId });
                    if (dangerousType) {
                        dangerousTypes.push(dangerousType[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}`]);
                    }
                }
                single.dangerousTypes = dangerousTypes;
            }

            if (cargos.length === 0) {
                cargos = []
                if (lang === "en") {
                    return res.status(200).json({ cargos });
                } if (lang === "ru") {
                    return res.status(200).json({ cargos });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(200).json({ cargos });
                }
            };

            res.status(200).json({
                cargos,
                totalCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / pageSize)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting cargos" });
        }
    }

    async getMyCargos(req, res) {
        try {
            const { lang } = req.params;
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 20;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'ASC';
            const userId = req.user.id;
            const totalCount = await Cargo.count({
                where: { userId: userId }
            });
            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTm'), 'name']],
            };
            let cargos = await Cargo.findAll({
                offset,
                limit: parseInt(pageSize),
                order: [[sort, sortOrder]],
                where: { userId: userId },
                attributes: {
                    exclude: ['updatedAt', 'userId', 'typeId', 'fromCountry', 'fromCity', 'toCountry', 'toCity']
                },
                include: [
                    {
                        model: CargoType,
                        as: "type",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "from_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "to_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "from_city",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "to_city",
                        attributes: attributes[lang]
                    }
                ]
            });
            for (const single of cargos) {
                const transportTypes = [];
                for (const typeId of single.typeTransport) {
                    const type = await TransportType.findByPk(typeId);
                    if (type) {
                        if (lang === "en") {
                            transportTypes.push(type.nameEn);
                        } if (lang === "ru") {
                            transportTypes.push(type.nameRu);
                        } if (lang === "tr") {
                            transportTypes.push(type.nameTr);
                        }
                        if (lang === "tm") {
                            transportTypes.push(type.nameTm);
                        }
                    }
                }
                single.typeTransport = transportTypes;
                let dangerousTypes = [];
                for (const dangerousTypeId of single.dangerousTypes || []) {
                    const dangerousType = await DangerousType.findByPk(dangerousTypeId);
                    if (dangerousType) {
                        dangerousTypes.push(dangerousType[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}`]);
                    }
                }
                single.dangerousTypes = dangerousTypes;
            }
            if (cargos.length === 0) {
                cargos = []
                if (lang === "en") {
                    return res.status(200).json({ cargos });
                } if (lang === "ru") {
                    return res.status(200).json({ cargos });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(200).json({ cargos });
                }
            }
            res.status(200).json({ cargos, totalCount, currentPage: parseInt(page), totalPages: Math.ceil(totalCount / pageSize) });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting my cargos" });
        }
    }

    async specificCargo(req, res) {
        try {
            console.log(req.params);
            const { id, lang } = req.params;
            console.log(id);
            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTm'), 'name']],
            };
            const cargo = await Cargo.findOne({
                where: { uuid: id },
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ['id', 'name', 'surname', 'email', 'phoneNumber']
                    },
                    {
                        model: CargoType,
                        as: "type",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "from_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "to_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "from_city",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "to_city",
                        attributes: attributes[lang]
                    }
                ]
            });



            if (!cargo) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Cargo not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Cargos not found" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "Cargos not found" });
                }
            }
            let transportTypes = [];
            for (const typeId of cargo.typeTransport) {

                const type = await TransportType.findByPk(typeId);
                if (type) {
                    if (lang === "en") {
                        transportTypes.push(type.nameEn);
                    } if (lang === "ru") {
                        transportTypes.push(type.nameRu);
                    } if (lang === "tr" || lang === "tm") {
                        transportTypes.push(type.nameTr);
                    }
                }


            }
            cargo.typeTransport = transportTypes;

            let dangerousTypes = [];
            for (const dangerousTypeId of cargo.dangerousTypes || []) {
                const dangerousType = await DangerousType.findOne({ id: dangerousTypeId });
                if (dangerousType) {
                    dangerousTypes.push(dangerousType[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}`]);
                }
            }
            cargo.dangerousTypes = dangerousTypes;
            res.status(200).json({ cargo });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in editing cargo" });
        }
    }

    async deleteCargo(req, res) {
        try {
            const { id, lang } = req.params;
            const cargo = await Cargo.findOne({ where: { uuid: id } });
            if (!cargo) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Cargo not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Cargos not found" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "Cargos not found" });
                }
            }
            await cargo.destroy();
            if (lang === "en") {
                return res.status(200).json({ message: "Cargo deleted successfully" });
            } if (lang === "ru") {
                return res.status(200).json({ message: "Cargo deleted successfully" });
            } if (lang === "tr" || lang === "tm") {
                return res.status(200).json({ message: "Cargo deleted successfully" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in deleting cargo" });
        }
    }
}

module.exports = CargoController;

