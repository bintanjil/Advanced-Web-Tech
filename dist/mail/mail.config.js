"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('mail', () => ({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM,
    domain: process.env.MAIL_DOMAIN || 'gadgeto.com',
    platformName: process.env.PLATFORM_NAME || 'Gadgeto E-Commerce',
}));
//# sourceMappingURL=mail.config.js.map