import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppService } from './app.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        WinstonModule.forRoot({
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/info.log' }),
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            ],
            levels: {
                alert: 0,
                error: 1,
                warning: 2,
                notice: 3,
                info: 4,
                debug: 5
            },
            format: winston.format.combine(
                winston.format.timestamp({format: '[Le] DD-MM-YYYY [à] HH:mm'}),
                winston.format.printf(info => `${info.timestamp} ${info.level}: \n${info.message}`),
            ),

        }),
    ],
    controllers: [
        AppController
    ],
    providers: [
        AppService,
    ],
    exports: [
        AppService,
    ]
})
export class AppModule { }
