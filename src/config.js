const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    server: {
        address: process.env.ADDRESS,
        port: process.env.PORT,
    },
    authorization: {
        username: process.env.AUTHORIZATION_USERNAME,
        password: process.env.AUTHORIZATION_PASSWORD,
    },
    authority: {
        name: process.env.AUTHORITY_MUNICIPALITY_NAME,
        email: process.env.AUTHORITY_CONTACT_EMAIL,
    },
    database: {
        config: {
            user: process.env.KSLINTEGRATION_DATABASE_USER,
            password: process.env.KSLINTEGRATION_DATABASE_PASSWORD,
            server: process.env.KSLINTEGRATION_DATABASE_SERVER,
            database: process.env.KSLINTEGRATION_DATABASE_DATABASE,
            options: {
                enableArithAbort: true
            }
        }
    },
};