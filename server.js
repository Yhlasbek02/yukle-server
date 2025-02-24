const express = require("express");
const { exec } = require("child_process");
const dotenv = require("dotenv");
const sequelize = require('./config/config');
const http = require("http");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Op } = require("sequelize");
const routes = require("./routes/allRoutes");
const country = require("./controllers/countryController");
const { verificationCodes, User } = require("./models/models");
dotenv.config();
const app = express();
const server = http.createServer(app);
const expressWs = require("express-ws")(app, server);
const UserAuthentification = require("./controllers/userController/authController");
const dirname = path.resolve();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
const PORT = 3001 || 8000;
app.use(cookieParser());
app.use(express.json());
UserAuthentification.setWebSocketServer(expressWs.getWss());
app.use("/", express.static(path.join(__dirname, "build")));
app.use("/api", routes);
app.use("/", country);
app.all("*", (req, res, next) => {
  return res.status(404).json({ message: `Can't find ${req.originalUrl} on this server` });
});

// const backupDatabase = () => {
//   const dbName = 'yukle';
//   const backupFileName = `backup_${Date.now()}.sql`;

//   // Command to execute pg_dump utility
//   const command = `PGPASSWORD=0104 pg_dump -U postgres -h localhost -p 5432 -d ${dbName} > ${backupFileName}`;

//   // Execute the command
//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error: ${error.message}`);
//       return;
//     }
//     if (stderr) {
//       console.error(`stderr: ${stderr}`);
//       return;
//     }
//     console.log(`Backup created successfully: ${backupFileName}`);
//   });
// };

async function deleteExpiredUsers() {
  const current_time = Date.now();

  try {
    // Fetch all expired codes
    const expiredCodes = await verificationCodes.findAll({
      where: { expireTime: { [Op.lte]: current_time } },
    });

    // Extract emails or phone numbers associated with expired codes
    const expiredEmailsOrNumbers = expiredCodes.map((code) => code.emailOrNumber);

    // Fetch unverified users whose email or phone number matches expired codes
    const usersToDelete = await User.findAll({
      where: {
        verified: false,
        [Op.or]: [
          { email: { [Op.in]: expiredEmailsOrNumbers } },
          { phoneNumber: { [Op.in]: expiredEmailsOrNumbers } },
        ],
      },
    });

    // Delete expired codes
    for (const code of expiredCodes) {
      console.log(`Deleting code: ${code.dataValues.code}`);
      await code.destroy();
    }

    // Delete unverified users
    for (const user of usersToDelete) {
      console.log(`Deleting user: ${user.dataValues.name} (${user.dataValues.email || user.dataValues.phoneNumber})`);
      await user.destroy();
    }

    console.log(
      `${usersToDelete.length} unverified users and ${expiredCodes.length} verification codes removed from the database`
    );
  } catch (error) {
    console.error('Error deleting expired users or codes:', error);
  }
}

// Run the function at regular intervals
setInterval(deleteExpiredUsers, 5 * 60 * 1000);

const { Cargo, Transport, Chat, ChatMessage, Message, TransportationType } = require("./models/models")

const start = async () => {
  try {
    // backupDatabase();
    await sequelize.authenticate();
    // await sequelize.sync({alter:true});
    server.listen(PORT, () => console.log(`server started on port ${PORT}`));
  } catch (error) {
    console.error(error);
  }
}

start();
