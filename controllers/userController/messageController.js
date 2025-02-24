const { ChatMessage, Chat, User } = require("../../models/models");
const { Op, fn, col, literal } = require("sequelize")
const { sendMessage } = require("../adminInitialize")
const sequelize = require("sequelize")
class MessageController {
    async createChat(req, res) {
        try {
            const { type, itemId, userId } = req.body;
            const currentUser = req.user.id;
            const exist = await Chat.findOne({ where: { type: type, itemId: itemId } });
            if (exist) {
                return res.status(200).json({ message: "Already exist", chat: exist });
            }
            const chat = await Chat.create({
                type: type,
                itemId: itemId,
                members: [currentUser, userId]
            });
            res.status(200).json({ message: "Created successfully", chat })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }

    async addMessage(req, res) {
        try {
            const { chatId } = req.params;
            const { message } = req.body;
            const userId = req.user.id;
            const chat = await Chat.findOne({ where: { uuid: chatId } });
            if (!chat) {
                return res.status(404).json({ message: "Not found" });
            }

            const otherUserId = chat.members.find((memberId) => memberId !== req.user.id);
            const otherUser = await User.findOne({ where: { id: otherUserId } });

            if (!otherUser) {
                return res.status(404).json({ message: "Not found" });
            }

            const newMessage = await ChatMessage.create({
                message, chatId: chat.id, userId
            });


            chat.lastMessage = message;
            chat.lastMessageTime = newMessage.createdAt;
            const formattedDate = newMessage.createdAt.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            sendMessage(otherUser.fcm_token, chat.uuid, message, otherUser.name, formattedDate)
            await chat.save();
            res.status(200).json({ newMessage });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" })
        }
    }

    async getMessages(req, res) {
        try {
            const { chatId } = req.params;
            const page = parseInt(req.query.page) || 1; // Default page 1
            const pageSize = parseInt(req.query.limit) || 10; // Default page size 10
            const offset = (page - 1) * pageSize;

            // Current user ID
            const currentUserId = req.user.id;

            // Find the chat by UUID
            const chat = await Chat.findOne({ where: { uuid: chatId } });
            if (!chat) {
                return res.status(404).json({ message: "Chat not found" });
            }

            // Fetch paginated messages
            const { rows: messages, count: totalMessages } = await ChatMessage.findAndCountAll({
                where: { chatId: chat.id },
                order: [['id', 'DESC']],
                limit: pageSize,
                offset: offset,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            // Update unread messages and add isMine field
            const unreadMessageIds = messages
                .filter(message => !message.isRead && message.userId !== currentUserId)
                .map(message => message.id);

            if (unreadMessageIds.length > 0) {
                await ChatMessage.update(
                    { isRead: true },
                    { where: { id: unreadMessageIds } }
                );
            }

            // Add isMine field to messages
            const enrichedMessages = messages.map(message => ({
                ...message.toJSON(),
                isMine: message.userId === currentUserId
            }));

            res.status(200).json({
                messages: enrichedMessages,
                pagination: {
                    currentPage: page,
                    limit: pageSize,
                    totalMessages: totalMessages,
                    totalPages: Math.ceil(totalMessages / pageSize)
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }



    async getChats(req, res) {
        try {
            const currentUserId = req.user.id;
            const chats = await Chat.findAll({
                where: {
                    members: {
                        [Op.contains]: [currentUserId]
                    }
                },
                order: [['updatedAt', 'DESC']]
            });

            let totalUnreadMessages = 0;

            const chatsWithUserData = await Promise.all(
                chats.map(async (chat) => {
                    const otherUserId = chat.members.find((id) => id !== currentUserId);

                    // Fetch the other user's name
                    const otherUser = await User.findOne({
                        where: { id: otherUserId },
                        attributes: ['id', 'name']
                    });

                    // Count unread messages sent by the other user
                    const unreadMessagesCount = await ChatMessage.count({
                        where: {
                            chatId: chat.id,
                            isRead: false,
                            userId: { [Op.ne]: currentUserId } // Exclude messages sent by the current user
                        }
                    });

                    totalUnreadMessages += unreadMessagesCount;

                    const lastMessage = await ChatMessage.findOne({
                        where: { chatId: chat.id },
                        order: [['createdAt', 'DESC']],
                        attributes: ['userId']
                    });

                    const isMine = lastMessage ? lastMessage.userId === currentUserId : false;

                    return {
                        ...chat.toJSON(),
                        otherUser: otherUser ? otherUser.name : "Unknown User",
                        userId: otherUser ? parseInt(otherUser.id) : null,
                        unreadMessagesCount,
                        isMine
                    };
                })
            );

            res.status(200).json({
                chats: chatsWithUserData,
                unreadMessages: totalUnreadMessages
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }


    async deleteMessage(req, res) {
        try {
            const message = await ChatMessage.findOne({ where: { uuid: req.params.id } });
            if (!message) {
                return res.status(404).json({ message: "Not found" });
            }
            await message.destroy();
            res.status(200).json({ message: "Deleted" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }

    async deleteChat(req, res) {
        try {
            const chat = await Chat.findOne({ where: { uuid: req.params.id } });
            if (!chat) {
                return res.status(404).json({ message: "Not found" });
            }

            const messages = await ChatMessage.findAll({ where: { chatId: chat.id } });

            for (const message of messages) {
                await message.destroy();
            }

            await chat.destroy();
            res.status(200).json({ message: "Deleted" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

const controllers = new MessageController();
module.exports = controllers;