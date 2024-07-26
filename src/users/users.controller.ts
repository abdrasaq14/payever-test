import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Res,
  HttpStatus,
  Param,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MailService } from '../mail/mail.service'; // Adjust the import path
import { RabbitMQService } from '../rabbitmq/rabbitmq.service'; // Adjust the import path
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
// import * as crypto from 'crypto';
import * as path from 'path';
@Controller('api')
export class UsersController {
  private readonly avatarDir = path.join(__dirname, '../../', 'uploads');

  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @Post('/users')
  async createUser(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const user = await this.userService.createUser(createUserDto);
      await this.mailService.sendUserCreationEmail(user.email);
      await this.rabbitMQService.emitUserCreatedEvent(user);
      res.status(HttpStatus.CREATED).json({
        message: 'User created successfully',
        user,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error creating user',
        error: error.message,
      });
    }
  }

  @Get('user/:userId')
  async getUser(@Res() res: Response, @Req() req: Request) {
    try {
      const userId = req.params.userId;
      const user = await this.userService.getUserById(userId);
      res.status(HttpStatus.OK).json({
        message: 'User fetched successfully',
        user,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error fetching user',
        error: error.message,
      });
    }
  }

  @Post('user/:userId/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          // Generate the filename with Date.now()
          const fileName = `${Date.now()}-${file.originalname}`;
          cb(null, fileName);
        },
      }),
    }),
  )
  async uploadAvatar(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      if (!file) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'No file uploaded',
        });
      }
      const base64Image = await this.userService.saveAvatar(userId, file);
      res.status(HttpStatus.OK).json({
        message: 'Avatar uploaded and saved successfully',
        image: base64Image,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error uploading avatar',
        error: error.message,
      });
    }
  }

  @Get('user/:userId/avatar')
  async getAvatar(@Param('userId') userId: string, @Res() res: Response) {
    try {
      const user = await this.userService.getUserById(userId);
      const filePath = path.join(this.avatarDir, user.avatar);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const base64Image = fileBuffer.toString('base64');
        res.status(HttpStatus.OK).json({
          image: base64Image,
        });
      } else {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Avatar not found',
        });
      }
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error fetching avatar',
        error: error.message,
      });
    }
  }

  @Delete('/user/:userId/avatar')
  async deleteUserAvatar(
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      await this.userService.deleteUserAvatar(userId);

      res.status(HttpStatus.OK).json({
        message: 'User avatar deleted successfully',
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Error deleting user avatar',
        error: error.message,
      });
    }
  }
}
