const { User, verificationCodes, Chat, ChatMessage } = require("../../models/models");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const WebSocket = require("ws");
const EventEmitter = require("events");
const { where, Op } = require("sequelize");
const MAX_LISTENERS = 20;
EventEmitter.defaultMaxListeners = MAX_LISTENERS;
const {sendSmsCode} = require("../adminInitialize");

let wss;
const emitter = new EventEmitter();
emitter.setMaxListeners(MAX_LISTENERS);

const activeClients = new Set();


let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'yukleteam023@gmail.com',
        pass: 'wetlwjijdqhyfpmd',
    }
});



class UserAuthentification {

    static setWebSocketServer() {
        try {
            wss = new WebSocket.Server({ port: 3002 });

            wss.on("connection", (ws) => {
                ws.isAlive = true;
                ws.on("pong", heartbeat);

                ws.on("message", (message) => {
                    ws.send("Echo: " + message);
                });

                ws.on("close", (code, reason) => {
                    console.log("Client disconnected with code:", code, "reason:", reason);
                    activeClients.delete(ws);
                });

                const interval = setInterval(() => {
                    wss.clients.forEach((ws) => {
                        if (!ws.isAlive) {
                            ws.terminate();
                            activeClients.delete(ws);
                            return;
                        }
                        ws.isAlive = false;
                        ws.ping();
                    });
                }, 10000);

                ws.on("close", () => {
                    clearInterval(interval);
                });

                activeClients.add(ws);
            });
        } catch (error) {
            console.error(error)
        }

    }

    static sendWebSocketMessage(event, data) {
        const payload = JSON.stringify({ event, data });
        activeClients.forEach((client) => {
            client.send(payload);
        });
    }
    async registerUserByEmail(req, res) {
        try {
            const { name, surname, email, password, fcmToken } = req.body;
            const { lang } = req.params;
            console.log(lang);
            const user = await User.findOne({ where: { email: email } });
            if (user) {
                if (lang === "en") {
                    return res.status(409).json({ message: "User already exists" });
                } if (lang === "ru") {
                    return res.status(409).json({ message: "User already exists" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(409).json({ message: "User already exists" });
                }
            }
            if (!name || !email || !password) {
                if (lang === "en") {
                    return res.status(400).json({ message: "All fields are required" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "All fields are required" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ message: "All fields are required" });
                }
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                if (lang === "en") {
                    return res.status(400).json({ message: "Please enter a valid email address" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "Please enter a valid email address" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ message: "Please enter a valid email address" });
                }
            }
            if (name.length <= 2) {
                if (lang === "en") {
                    return res.status(400).json({ message: "Name must be at least 2 characters long" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "Name must be at least 2 characters long" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ message: "Name must be at least 2 characters long" });
                }
            }
            if (password.length <= 4) {
                if (lang === "en") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                }
            }
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(password, salt);

            await User.create({
                name: name,
                surname: surname,
                email: email,
                password: hashPassword,
                fcm_token: fcmToken
            });

            const randomNumber = Math.floor(Math.random() * 9000) + 1000;
            console.log(randomNumber);
            const expireTime = new Date(Date.now() + 5 * 60 * 1000);
            await verificationCodes.create({
                code: randomNumber,
                emailOrNumber: email,
                expireTime: expireTime
            });

            var mailOptions = {
                require: "yukleteam023@gmail.com",
                to: email,
                subject: "Secret Key",
                html: "<h3>Verification code is </h3>" + "<h1>" + randomNumber + "</h1>" + "<h3>Verification code expires in 5 minutes</h3>"
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                }
                if (!info.messageId) {
                    console.error("Message ID is undefined. Email may not have been sent.");
                }
                console.log('====================================');
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                if (lang === "en") {
                    return res.send({ status: true, message: "Otp code sent" });
                } if (lang === "ru") {
                    return res.send({ status: true, message: "Otp code sent" });
                } if (lang === "tr" || lang === "tm") {
                    return res.send({ status: true, message: "Otp code sent" });
                }
            });
            if (lang === "en") {
                return res.status(201).send({ message: "Please verify your email" });
            } if (lang === "ru") {
                return res.status(201).send({ message: "Please verify your email" });
            } if (lang === "tr" || lang === "tm") {
                return res.status(201).send({ message: "Please verify your email" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in registering user" });
        }
    }

    async registerUserByPhone(req, res) {
        try {
            const { name, surname, phoneNumber, password, fcmToken } = req.body;
            const { lang } = req.params;
            const user = await User.findOne({ where: { phoneNumber: phoneNumber } });
            if (user) {
                if (lang === "en") {
                    return res.status(404).json({ message: "User already exists" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "User already exists" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "User already exists" });
                }
            }
            if (!name || !surname || !phoneNumber || !password) {
                if (lang === "en") {
                    return res.status(400).json({ message: "All fields are required" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "All fields are required" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ message: "All fields are required" });
                }
            }
            if (password.length <= 4) {
                if (lang === "en") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                }
            }
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(password, salt);
            const newuser = await User.create({
                name: name,
                surname: surname,
                phoneNumber: phoneNumber,
                password: hashPassword,
                fcm_token: fcmToken
            });


            const randomNumber = Math.floor(Math.random() * 9000) + 1000;
            const str = randomNumber.toString();
            const text = `Your OTP code is ${str}`
            
            const expireTime = new Date(Date.now() + 5 * 60 * 1000);
            await verificationCodes.create({
                code: randomNumber,
                emailOrNumber: phoneNumber,
                expireTime: expireTime
            })
            sendSmsCode(phoneNumber, str);
            UserAuthentification.sendWebSocketMessage("code", { phone: phoneNumber, code: text });
            if (lang === "en") {
                return res.status(201).json({ message: "Verify your phone number" });
            } if (lang === "ru") {
                return res.status(201).json({ message: "Verify your phone number" });
            } if (lang === "tr" || lang === "tm") {
                return res.status(201).json({ message: "Verify your phone number" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in registering user" });
        }
    }

    async verifyCode(req, res) {
        try {
            const { otp, email } = req.body; // `email` can represent either email or phone number
            const { lang } = req.params;

            // Find the verification code
            const code = await verificationCodes.findOne({
                where: { code: otp, emailOrNumber: email }
            });

            if (!code) {
                const messages = {
                    en: "Incorrect OTP, please try again",
                    ru: "Incorrect OTP, please try again russian",
                    tr: "Incorrect OTP, please try again turkish",
                    tm: "Incorrect OTP, please try again turkmen"
                };
                return res.status(404).json({ message: messages[lang] || messages.en });
            }

            // Check if the code is expired
            const now = new Date();
            if (code.expireTime <= now) {
                const messages = {
                    en: "Verification code has expired! Please resend it again.",
                    ru: "Verification code has expired! Please resend it again russian.",
                    tr: "Verification code has expired! Please resend it again turkish",
                    tm: "Verification code has expired! Please resend it again turkish"
                };
                return res.status(401).json({ message: messages[lang] || messages.en });
            }

            // Find user by email or phone number
            let user = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: email },
                        { phoneNumber: email }
                    ]
                }
            });

            if (!user) {
                const messages = {
                    en: "User not found",
                    ru: "User not found russian",
                    tr: "User not found turkish",
                    tm: "User not found turkish"
                };
                return res.status(404).json({ message: messages[lang] || messages.en });
            }

            // Verify the user
            user.verified = true;
            await user.save();
            console.log(user.verified)

            // Generate token
            const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '99 years' });

            const successMessages = {
                en: "User successfully verified",
                ru: "User successfully verified russian",
                tr: "User successfully verified turkish",
                tm: "User successfully verified turkmen"
            };
            return res.status(200).json({ message: successMessages[lang] || successMessages.en, token });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error in verifying OTP" });
        }
    }


    async loginByEmail(req, res) {
        try {
            const { email, password, fcmToken } = req.body;
            console.log(req.body);
            const { lang } = req.params;
            if (!email || !password) {
                if (lang === "en") {
                    return res.status(400).json({ message: "All fields are required" })
                } if (lang === "ru") {
                    return res.status(400).json({ message: "All fields are required russian" })
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ message: "All fields are required turkish" })
                }
            }
            const user = await User.findOne({ where: { email: email } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ message: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "User not found russian" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "User not found turkish" });
                }
            }
            const isMatch = await bcryptjs.compare(password, user.password);
            if (user.email === email && isMatch) {
                if (user.verified === false) {
                    if (lang === "en") {
                        return res.status(400).json({ message: "Please verify your email" });
                    } if (lang === "ru") {
                        return res.status(400).json({ message: "Please verify your email russian" });
                    } if (lang === "tr" || lang === "tm") {
                        return res.status(400).json({ message: "Please verify your email turkish" });
                    }
                }
                const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '99 years' });
                // if (lang === "en") {
                //     console.log("english")
                //     
                // } if (lang === "ru") {
                //     res.status(200).json({ message: "Login successful russian", token });
                // } if (lang === "tr") {
                //     res.status(200).json({ message: "Login successful turkish", token });
                // }
                user.fcm_token = fcmToken;
                await user.save();
                res.status(200).json({ message: "Login successful", token });
            }
            else {
                if (lang === "en") {
                    return res.status(404).json({ message: "Password is wrong! Try again" })
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Password is wrong! Try again russian" })
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "Password is wrong! Try again turkish" })
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in login by email" });
        }
    }

    async loginByMobile(req, res) {
        try {
            const { phoneNumber, password, fcmToken } = req.body;
            const { lang } = req.params;
            if (!phoneNumber || !password) {
                if (lang === "en") {
                    return res.status(400).json({ message: "All fields are required" })
                } if (lang === "ru") {
                    return res.status(400).json({ message: "All fields are required russian" })
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ message: "All fields are required turkish" })
                }
            }
            const user = await User.findOne({ where: { phoneNumber: phoneNumber } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ message: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "User not found russian" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "User not found turkish" });
                }
            }
            const isMatch = await bcryptjs.compare(password, user.password);
            console.log(user.verified);
            if (isMatch) {
                if (user.verified === false) {
                    if (lang === "en") {
                        return res.status(400).json({ message: "Please verify your email" });
                    } if (lang === "ru") {
                        return res.status(400).json({ message: "Please verify your email russian" });
                    } if (lang === "tr" || lang === "tm") {
                        return res.status(400).json({ message: "Please verify your email turkish" });
                    }
                }
                const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '99 days' });
                user.fcm_token = fcmToken;
                await user.save()
                if (lang === "en") {
                    return res.status(200).json({ message: "Login successful", token });
                } if (lang === "ru") {
                    return res.status(200).json({ message: "Login successful russian", token });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(200).json({ message: "Login successful turkish", token });
                }
            }
            else {
                if (lang === "en") {
                    return res.status(404).json({ message: "Password is wrong! Try again" })
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Password is wrong! Try again russian" })
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "Password is wrong! Try again turkish" })
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in login by email" });
        }
    }

    async resendVerificationCodeByEmail(req, res) {
        try {
            const { email } = req.body;
            const { lang } = req.params;
            if (!email) {
                if (lang === "en") {
                    return res.status(400).json({ error: "Email is required" });
                } if (lang === "ru") {
                    return res.status(400).json({ error: "Email is required" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ error: "Email is required" });
                }

            }

            const user = await User.findOne({ where: { email: email } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ error: "User not found" });
                }
            }

            const randomNumber = Math.floor(Math.random() * 9000) + 1000;
            console.log(randomNumber);
            const expireTime = new Date(Date.now() + 5 * 60 * 1000);
            await verificationCodes.create({ code: randomNumber, expireTime: expireTime, emailOrNumber: email });
            var mailOptions = {
                require: "yukleteam023@gmail.com",
                to: email,
                subject: "Secret Key",
                html: "<h3>Verification code is </h3>" + "<h1>" + randomNumber + "</h1>" + "<h3>Verification code expires in 5 minutes</h3>"
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                }
                console.log('====================================');
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            });
            if (lang === "en") {
                return res.status(201).json({ message: "OTP code was sent" });
            } if (lang === "ru") {
                return res.status(201).json({ message: "OTP code was sent" });
            } if (lang === "tr" || lang === "tm") {
                return res.status(201).json({ message: "OTP code was sent" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error resending verification code" });
        }
    }

    async resendVerificationCodeByMobile(req, res) {
        try {
            const { phoneNumber } = req.body;
            const { lang } = req.params;
            if (!phoneNumber) {
                if (lang === "en") {
                    return res.status(400).json({ error: "Phone is required" });
                } if (lang === "ru") {
                    return res.status(400).json({ error: "Email is required" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ error: "Email is required" });
                }

            }

            const user = await User.findOne({ where: { phoneNumber } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ error: "User not found" });
                }
            }

            const randomNumber = Math.floor(Math.random() * 9000) + 1000;
            const str = randomNumber.toString()
            const expireTime = new Date(Date.now() + 5 * 60 * 1000);
            await verificationCodes.create({ code: randomNumber, expireTime: expireTime, emailOrNumber: phoneNumber });
            sendSmsCode(phoneNumber, str);
            if (lang === "en") {
                return res.status(201).json({ message: "OTP code was sent" });
            } if (lang === "ru") {
                return res.status(201).json({ message: "OTP code was sent" });
            } if (lang === "tr" || lang === "tm") {
                return res.status(201).json({ message: "OTP code was sent" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error resending verification code" });
        }
    }

    async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            const { lang } = req.params;
            if (!otp || !email) {
                if (lang === "en") {
                    return res.status(400).json({ message: "All fields are required" })
                } if (lang === "ru") {
                    return res.status(400).json({ message: "All fields are required russian" })
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ message: "All fields are required turkish" })
                }
            }
            const code = await verificationCodes.findOne({ where: { code: otp, emailOrNumber: email } });
            if (!code) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Password is wrong" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Password is wrong" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "Password is wrong" });
                }
            }
            const expireTime = code.expireTime;
            const now = new Date(Date.now());
            if (expireTime <= now) {
                if (lang === "en") {
                    return res.status(401).json({ message: "Verification code has expired! Please resend it again." });
                } if (lang === "ru") {
                    return res.status(401).json({ message: "Verification code has expired! Please resend it again." });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(401).json({ message: "Verification code has expired! Please resend it again." });
                }
            }
            const user = await User.findOne({ where: { email: email } });
            await code.destroy();
            const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '7 days' });
            if (lang === "en") {
                return res.status(201).json({ message: "Verification is true. Change your password", token });
            } if (lang === "ru") {
                return res.status(201).json({ message: "Verification is true. Change your password", token });
            } if (lang === "tr" || lang === "tm") {
                return res.status(201).json({ message: "Verification is true. Change your password", token });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async verifyMobileOtp(req, res) {
        try {
            const { phoneNumber, otp } = req.body;
            const { lang } = req.params;
            if (!otp || !phoneNumber) {
                if (lang === "en") {
                    return res.status(400).json({ message: "All fields are required" })
                } if (lang === "ru") {
                    return res.status(400).json({ message: "All fields are required russian" })
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ message: "All fields are required turkish" })
                }
            }
            const code = await verificationCodes.findOne({ where: { code: otp, emailOrNumber: phoneNumber } });
            if (!code) {
                if (lang === "en") {
                    return res.status(404).json({ message: "Password is wrong" });
                } if (lang === "ru") {
                    return res.status(404).json({ message: "Password is wrong" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ message: "Password is wrong" });
                }
            }
            const expireTime = code.expireTime;
            const now = new Date(Date.now());
            if (expireTime <= now) {
                if (lang === "en") {
                    return res.status(401).json({ message: "Verification code has expired! Please resend it again." });
                } if (lang === "ru") {
                    return res.status(401).json({ message: "Verification code has expired! Please resend it again." });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(401).json({ message: "Verification code has expired! Please resend it again." });
                }
            }
            const user = await User.findOne({ where: { phoneNumber } });
            await code.destroy();
            const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '7 days' });
            if (lang === "en") {
                return res.status(201).json({ message: "Verification is true. Change your password", token });
            } if (lang === "ru") {
                return res.status(201).json({ message: "Verification is true. Change your password", token });
            } if (lang === "tr" || lang === "tm") {
                return res.status(201).json({ message: "Verification is true. Change your password", token });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async createNewPassword(req, res) {
        try {
            const { password, confirmPassword } = req.body;
            const { lang } = req.params;
            if (password !== confirmPassword) {
                if (lang === "en") {
                    return res.status(400).json({ message: "Passwords do not match" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "Passwords do not match" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ message: "Passwords do not match" });
                }

            }
            if (password.length < 4) {
                if (lang === "en") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                } if (lang === "ru") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(400).json({ message: "Password must be at least 4 characters long" });
                }

            }
            const id = req.user.id;
            const user = await User.findOne({ where: { id: id } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ error: "User not found" });
                }
            }
            const salt = await bcryptjs.genSalt(10);
            const hashPassword = await bcryptjs.hash(password, salt);
            user.password = hashPassword;
            await user.save();
            if (lang === "en") {
                return res.status(200).json({ message: "Password updated successfully" });
            } if (lang === "ru") {
                return res.status(200).json({ message: "Password updated successfully" });
            } if (lang === "tr" || lang === "tm") {
                return res.status(200).json({ message: "Password updated successfully" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error updating password" });
        }
    }

    async getMyProfile(req, res) {
        try {
            const userID = req.user.id; // Current user's ID
            const { lang } = req.params;

            // Fetch user details
            const user = await User.findByPk(userID, {
                attributes: { exclude: ['password'] },
            });

            if (!user) {
                const errorMessages = {
                    en: "User not found",
                    ru: "Пользователь не найден",
                    tr: "Kullanıcı bulunamadı",
                    tm: "User not found"
                };
                return res.status(404).json({ error: errorMessages[lang] || "User not found" });
            }

            // Step 1: Fetch all chats where the current user is a member
            const chats = await Chat.findAll({
                where: {
                    members: { [Op.contains]: [userID] } // Check if userID is in the members array
                },
                attributes: ['id'] // Only fetch chat IDs
            });

            // Extract chat IDs
            const chatIds = chats.map(chat => chat.id);

            // Step 2: Calculate total unread messages
            let unreadMessagesCount = 0;

            if (chatIds.length > 0) {
                unreadMessagesCount = await ChatMessage.count({
                    where: {
                        chatId: { [Op.in]: chatIds }, // Messages from relevant chats
                        isRead: false,                // Only unread messages
                        userId: { [Op.ne]: userID }   // Exclude messages sent by the current user
                    }
                });
            }

            // Step 3: Respond with user profile and unread message count
            res.status(200).json({
                ...user.toJSON(),
                unreadMessages: unreadMessagesCount
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error retrieving user profile" });
        }
    }

    async editAccount(req, res) {
        try {
            const id = req.user.id;
            const { lang } = req.params;
            const { name, surname, phoneNumber, email, transportNotification, cargoNotification } = req.body;
            console.log(req.body)
            const user = await User.findOne({ where: { id } });
            if (!user) {
                const errorMessages = {
                    en: "User not found",
                    ru: "Пользователь не найден",
                    tr: "Kullanıcı bulunamadı",
                    tm: "User not found"
                };
                return res.status(404).json({ message: errorMessages[lang] || errorMessages.en });
            }

            // if (!name || !email) {
            //     const errorMessages = {
            //         en: "All fields are required",
            //         ru: "Все поля обязательны для заполнения",
            //         tr: "Tüm alanlar gereklidir"
            //     };
            //     return res.status(400).json({ message: errorMessages[lang] || errorMessages.en });
            // }

            user.name = name || user.name;
            user.phoneNumber = phoneNumber || user.phoneNumber;
            user.email = email || user.email;
            user.surname = surname || user.surname;
            user.cargoNotification = cargoNotification || user.cargoNotification;
            user.transportNotification = transportNotification || user.transportNotification
            await user.save();

            if (email !== user.email) {
                const mailOptions = {
                    from: "yukleteam023@gmail.com",
                    to: email,
                    subject: "Email changed",
                    html: "Your email has been changed"
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error("Error sending email:", error);
                    } else {
                        console.log('Message sent:', info.messageId);
                        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
                    }
                });
            }

            res.status(200).json({ user, message: "Account edited successfully" });
        } catch (error) {
            console.error("Error editing account:", error);
            res.status(500).json({ message: "An error occurred while editing the account" });
        }
    }


    async changeNotification(req, res) {
        try {
            const { type } = req.params;
            const user = await User.findOne({ where: { id: req.user.id } });
            if (type === "transport") {
                const transport = user.transportNotification;
                if (transport) {
                    user.transportNotification = false;
                    await user.save();
                } else {
                    user.transportNotification = true;
                    await user.save();
                }
            } else if (type === "cargo") {
                const cargo = user.cargoNotification;
                if (cargo) {
                    user.cargoNotification = false;
                    await user.save()
                } else {
                    user.cargoNotification = true;
                    await user.save();
                }
            }
            res.status(200).json({ message: "Successfully updated" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }

    async deleteAccount(req, res) {
        try {
            const { lang } = req.params;
            const user = await User.findOne({ where: { id: req.user.id } });
            if (!user) {
                if (lang === "en") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "ru") {
                    return res.status(404).json({ error: "User not found" });
                } if (lang === "tr" || lang === "tm") {
                    return res.status(404).json({ error: "User not found" });
                }
            }
            await user.destroy();
            if (lang === "en") {
                return res.status(200).json({ message: "Account deleted successfully" });
            } if (lang === "ru") {
                return res.status(200).json({ message: "User deleted successfully" });
            } if (lang === "tr" || lang === "tm") {
                return res.status(200).json({ message: "User deleted successfully" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in deleting account" });
        }
    }

    async logout(req, res) {
        try {
            const id = req.user.id
            const user = await User.findOne({ where: { id } });
            user.fcm_token = '';
            await user.save();
            res.status(200).json({ message: "Logout successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error in deleting account" });
        }
    }

}

function heartbeat() {
    this.isAlive = true;
}

module.exports = UserAuthentification;