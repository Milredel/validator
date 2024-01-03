import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(helmet());
    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({ // this allow to print validation error when performing format test with pipe below
            exceptionFactory: (validationErrors: ValidationError[] = []) => {
                console.error(validationErrors);
                return new BadRequestException(validationErrors);
            },
            transform: true,
        }),
        new ValidationPipe({ // this allows to validate payload format before entering in controller code
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
