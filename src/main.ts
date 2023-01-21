import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(helmet());
    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
            exceptionFactory: (validationErrors: ValidationError[] = []) => {
                console.error(validationErrors);
                return new BadRequestException(validationErrors);
            },
            transform: true,
        }),
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            validationError: {
                target: true,
                value: true
            },
            forbidUnknownValues: true
        }),
    );
    await app.listen(3000);
}
bootstrap();
