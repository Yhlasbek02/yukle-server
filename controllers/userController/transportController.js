const { User, Transport, TransportType, country, city, Cargo, Notifications , TransportationType, TruckBody} = require("../../models/models");
const { Op, Sequelize } = require("sequelize");
const {sendNotification} = require("../adminInitialize");

class transportController {

    async getTransportationType(req, res) {
        try {
            const { lang } = req.params;
            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
            };
            const types = await TransportationType.findAll({
                attributes: attributes[lang] || {}
            });
            console.log(types)
            if (!types || types.length === 0) {
                return res.status(404).json({ message: "Not found" })

            }
            res.status(200).json({ types });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting transport types" });
        }
    }

    async getTruckBody(req, res) {
        try {
            const {id} = req.params;
            const { lang } = req.params;
            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTm'), 'name']],
            };
            let data = await TruckBody.findAll({where: {transportTypeId: id}, attributes: attributes[lang] || {}});
            if (data.length === 0) {
                data = []
            }
            res.status(200).json({data})
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting truck types" });
        }
    }

    async getTransportTypes(req, res) {
        try {
            const { lang } = req.params;
            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
            };
            const types = await TransportType.findAll({
                attributes: attributes[lang] || {}
            });
            console.log(types)
            if (!types || types.length === 0) {
                return res.status(404).json({ message: "Not found" })

            }
            res.status(200).json({ types });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting transport types" });
        }
    }


    async addTransport(req, res) {
        async function sendNotificationsAfterResponse(tokens, uuid, type, locationCountry) {
            const notificationPromises = tokens.map((token) =>
                sendNotification(token, 'New transport added', locationCountry, `${uuid}`, type, locationCountry)
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
                locationCountry,
                locationCity,
                transportationType,
                weight,
                volume,
                name,
                phoneNumber,
                email,
                desiredDirection,
                whatsApp,
                truckBodyId,
                additional_info
            } = req.body;
            if (!typeId || !locationCountry || !name) {
                if (!phoneNumber && !email) {
                    if (lang === "en") {
                        return res.status(404).json({ message: "Fields are required" });
                    } if (lang === "ru") {
                        return res.status(404).json({ message: "Fields are required" });
                    } if (lang === "tr" || lang === "tm") {
                        return res.status(404).json({ message: "Fields are required" });
                    }
                }
            }
            const userId = req.user.id;
            const newTransport = await Transport.create({
                locationCountry,
                locationCity,
                desiredDirection: desiredDirection,
                typeId: typeId,
                whatsApp,
                transportationTypeId: transportationType,
                weight,
                volume,
                email,
                phoneNumber,
                name,
                truckBodyId,
                userId: userId,
                additional_info
            });
            const locationCountryName = await country.findOne({where: {id: locationCountry}})
            const cargos = await Cargo.findAll({ where: { fromCountry: locationCountry, userId: { [Op.ne]: userId } } })
            const notificationTokens = [];
            const userIds = []

            for (const cargo of cargos) {
                const user = await User.findOne({ where: { id: cargo.userId } });
                console.log(user.dataValues);
                if (user.fcm_token && user.transportNotification && !notificationTokens.includes(user.fcm_token)) {
                    userIds.push(user.id);
                    notificationTokens.push(user.fcm_token);
                }
            }


            if (lang === "en") {
                res.status(200).json({ message: "Transport added successfully", newTransport });
            } else if (lang === "ru") {
                res.status(200).json({ message: "Transport added successfully", newTransport });
            } else if (lang === "tr" || lang=== "tm") {
                res.status(200).json({ message: "Transport added successfully", newTransport });
            }
            try {
                console.log("this is notification part");
                const notification = await Notifications.create({
                    userIds: userIds,
                    body: "New Transport",
                    url: `transport/${newTransport.uuid}`,
                    type: 'transport'
                })
                console.log("new notification:", notification);
                await sendNotificationsAfterResponse(notificationTokens, `${newTransport.uuid}`, "transport", locationCountryName.nameEn);
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in adding transport" });
        }
    }

    async getTransports(req, res) {
        try {
            const { lang } = req.params;
            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']]
            };
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 12;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'DESC';
            const filters = {
                typeId: req.query.type,
                locationCountry: req.query.location,
                transportationTypeId: req.query.transportation,
                truckBodyId: req.body.truckbody,
                userId: {
                    [Op.ne]: req.user.id
                }
            };


            Object.keys(filters).forEach((key) => {
                if (filters[key] === undefined || filters[key] === "") {
                    delete filters[key];
                }
            });
            const totalCount = await Transport.count({
                where: { ...filters, userId: { [Op.ne]: req.user.id } }
            });
            let transports = await Transport.findAll({
                offset,
                limit: parseInt(pageSize),
                where: filters,
                order: [[sort, sortOrder]],
                attributes: {
                    exclude: ['updatedAt', 'userId', 'typeId', 'belongsTo', 'locationCountry', 'locationCity']
                },
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ['id', 'name', 'surname', 'email', 'phoneNumber']
                    },
                    {
                        model: TransportType,
                        as: "type",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "location_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "location_city",
                        attributes: attributes[lang]
                    },
                    {
                        model: TransportationType,
                        as: 'transportationType',
                        attributes: attributes[lang]
                    },
                    {
                        model: TruckBody,
                        as: 'truckBody',
                        attributes: attributes[lang]
                    }
                ]
            });
            for (const single of transports) {
                const desiredDirectionCountries = [];
                for (const directionId of single.desiredDirection) {
                    const directionCountry = await country.findByPk(directionId);
                    if (directionCountry) {
                        if (lang === "en") {
                            desiredDirectionCountries.push(directionCountry.nameEn);
                        } else if (lang === "ru") {
                            desiredDirectionCountries.push(directionCountry.nameRu);
                        } else {
                            desiredDirectionCountries.push(directionCountry.nameTr);
                        }

                    }
                }
                single.desiredDirection = desiredDirectionCountries;
            }
            
            if (transports.length === 0) {
                transports = []
                return res.status(200).json({ transports });
            };

            res.status(200).json({
                transports,
                totalCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / pageSize)
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting transports" });
        }
    }

    async myTransport(req, res) {
        try {
            const { lang } = req.params;
            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']]
            };
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 12;

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const sort = req.query.sort || 'createdAt';
            const sortOrder = req.query.order || 'ASC';
            const id = req.user.id;
            const totalCount = await Transport.count({
                where: { userId: id }
            });
            let transports = await Transport.findAll({
                offset,
                limit: parseInt(pageSize),
                order: [[sort, sortOrder]],
                where: { userId: id },
                attributes: {
                    exclude: ['updatedAt', 'userId', 'typeId', 'belongsTo', 'locationCountry', 'locationCity']
                },
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ['name', 'surname', 'email', 'phoneNumber']
                    },
                    {
                        model: TransportType,
                        as: "type",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "location_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "location_city",
                        attributes: attributes[lang]
                    },
                    {
                        model: TransportationType,
                        as: 'transportationType',
                        attributes: attributes[lang]
                    },
                    {
                        model: TruckBody,
                        as: 'truckBody',
                        attributes: attributes[lang]
                    }
                ]
            });
            for (const single of transports) {
                const desiredDirectionCountries = [];
                for (const directionId of single.desiredDirection) {
                    const directionCountry = await country.findByPk(directionId);
                    if (directionCountry) {
                        desiredDirectionCountries.push(directionCountry.nameEn);
                    }
                }
                single.desiredDirection = desiredDirectionCountries;
            }
            if (transports.length === 0) {
                transports = []
                if (lang === "en") {
                    return res.status(200).json({ transports });
                } if (lang === "ru") {
                    return res.status(200).json({ transports });
                } if (lang === "tr" || lang == "tm") {
                    return res.status(200).json({ transports });
                }
            }
            res.status(200).json({
                transports,
                totalCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / pageSize)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in getting my transport" })
        }
    }

    async specificTransport(req, res) {
        try {
            console.log(req.params);
            const { id, lang } = req.params;
            const attributes = {
                en: ['id', 'uuid', [Sequelize.col('nameEn'), 'name']],
                ru: ['id', 'uuid', [Sequelize.col('nameRu'), 'name']],
                tr: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']],
                tm: ['id', 'uuid', [Sequelize.col('nameTr'), 'name']]
            };
            const transport = await Transport.findOne({
                where: { uuid: id },
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ['name', 'surname', 'email', 'phoneNumber']
                    },
                    {
                        model: TransportType,
                        as: "type",
                        attributes: attributes[lang]
                    },
                    {
                        model: country,
                        as: "location_country",
                        attributes: attributes[lang]
                    },
                    {
                        model: city,
                        as: "location_city",
                        attributes: attributes[lang]
                    },
                    {
                        model: TransportationType,
                        as: 'transportationType',
                        attributes: attributes[lang]
                    },
                    {
                        model: TruckBody,
                        as: 'truckBody',
                        attributes: attributes[lang]
                    }

                ]
            });
            if (!transport) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Transport not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Transport not found" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "Transport not found" });
                }
            }

            const desiredDirectionCountries = [];
                for (const directionId of transport.desiredDirection) {
                    const directionCountry = await country.findByPk(directionId);
                    if (directionCountry) {
                        if (lang === "en") {
                            desiredDirectionCountries.push(directionCountry.nameEn);
                        } else if (lang === "ru") {
                            desiredDirectionCountries.push(directionCountry.nameRu);
                        } else {
                            desiredDirectionCountries.push(directionCountry.nameTr);
                        }

                    }
                }
                transport.desiredDirection = desiredDirectionCountries;


            res.status(200).json({ transport });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in editing cargo" });
        }
    }

    async deleteTransport(req, res) {
        try {
            const { id, lang } = req.params;
            const transport = await Transport.findOne({ where: { uuid: id } });
            if (!transport) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Transport not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Transport not found" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "Transport not found" });
                }
            }
            await transport.destroy();
            if (lang === "en") {
                return res.status(200).json({ message: "Transport deleted successfully" });
            } if (lang === "ru") {
                return res.status(200).json({ message: "Transport deleted successfully" });
            } if (lang === "tr" || lang === "tm") {
                return res.status(200).json({ message: "Transport deleted successfully" });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in deleting transport" });
        }
    }
}

module.exports = transportController;