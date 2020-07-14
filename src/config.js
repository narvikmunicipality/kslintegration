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
    visma: {
        xmlpath: process.env.VISMA_XML_FILE_PATH,
        ws_url: process.env.VISMA_WS_URL_XML,
        ws_user: process.env.VISMA_WS_USER,
        ws_password: process.env.VISMA_WS_PASSWORD,
    },
    ldap: {
        config: {
            user: process.env.ACTIVE_DIRECTORY_LOOKUP_USER,
            password: process.env.ACTIVE_DIRECTORY_LOOKUP_PASSWORD,
            timeout: process.env.ACTIVE_DIRECTORY_LOOKUP_CONNECT_TIMEOUT,
            serverUrl: process.env.ACTIVE_DIRECTORY_LOOKUP_SERVER_URL,
            basedn: process.env.ACTIVE_DIRECTORY_LOOKUP_BASEDN,
        }
    },
    kslintegration: {
        visma_data_extractor: {
            manager_codes: JSON.parse(process.env.KSLINTEGRATION_VISMA_DATA_EXTRACTOR_MANAGER_CODES)
        }
    },
};
