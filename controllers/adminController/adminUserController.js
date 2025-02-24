const {User, Cargo, Transport, Message, adminMessage} = require("../../models/models");

class UserController {
    async getAllUsers (req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.pageSize || 6;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const {searchKey} = req.query;
            let queryOptions = {
                limit: parseInt(limit),
                offset,
                order: [['id', 'DESC']]
            };
            if (searchKey) {
                queryOptions.where = {
                    email: {
                        [Op.like]: `%${searchKey}%`
                    }
                };
            }
            const { count, rows: users } = await User.findAndCountAll(queryOptions);
            const totalPages = Math.ceil(count / parseInt(limit));
            res.status(200).json({
                users,
                totalPages,
                totalUsers: count,
                currentPage: page
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting all users"});
        }
    }

    async getUser (req, res) {
        try {
            const {id} = req.params;
            const user = await User.findOne(
                {where: {uuid: id}},
                {include: [
                    {model: Cargo, as: 'cargos'},
                    {model: Transport, as: 'transports'}
                ]}
            );
            if (!user) {
                return res.status(404).json({message: "User not found"});
            }
            res.status(200).json({user});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Error in getting specific user"});
        }
    }

    async deleteUser (req, res) {
        try {
            const {id} = req.params;
            const user = await User.findOne(
                {where: {uuid: id}},
                {
                    include: [
                        {model: Transport, as: 'transports'},
                        {model: Cargo, as: 'cargos'},
                        {model: Message, as: "messages"}
                    ]
                }
            );

            if (!user) {
                return res.status(404).json({message: "User not found"});
            };

            const transports = await Transport.findAll({where: {userId: user.id}});
            const cargos = await Cargo.findAll({where: {userId: user.id}});
            const messages = await Message.findAll({where: {senderId: user.id}});
            console.log(transports, cargos);
            
            for (const transport of transports) {
                await transport.destroy();
            }
            for (const cargo of cargos) {
                await cargo.destroy();
            }
            for (const message of messages) {
                await adminMessage.destroy({where: {messageId: message.id}})
                await message.destroy();
            }
            await user.destroy();
            return res.status(200).json({message: "User deleted"});
        } catch (error) {
            console.error(error);
            res.status(500).json({messsage: "Error in deleting user"});
        }
    }

    async changePaid (req, res) {
        try {
            const {id} = req.params;
            const user = await User.findOne({where: {uuid: id}});
            if (!user) {
                return res.status(404).json({message: 'User not found'});
            }
            console.log(user.paid);
            if (user.paid === true) {
                user.paid = false;
                await user.save();
            } else {
                user.paid = true;
                await user.save();
            }
            res.status(200).json({message: "Paid changed successfully"});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Server error"});
        }
    }
}

module.exports = UserController;