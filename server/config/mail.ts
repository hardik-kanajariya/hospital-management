import { defineConfig, transports } from '@adonisjs/mail'
import env from '#start/env'

const mailConfig = defineConfig({
    default: 'smtp',

    /**
     * The mailers object can be used to configure multiple mailers
     * each using a different transport or same transport with different
     * options.
     */
    mailers: {
        smtp: transports.smtp({
            host: env.get('EMAIL_HOST', 'localhost'),
            port: env.get('EMAIL_PORT', 587),
            auth: {
                type: 'login',
                user: env.get('EMAIL_USER', ''),
                pass: env.get('EMAIL_PASSWORD', ''),
            },
        }),
    },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
    export interface MailersList extends InferMailers<typeof mailConfig> { }
}
