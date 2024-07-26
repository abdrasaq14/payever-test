import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { MailService } from '../mail/mail.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';

describe('UsersController', () => {
  let controller: UsersController;
  let userService: UserService;
  let mailService: MailService;
  let rabbitMQService: RabbitMQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            getUserById: jest.fn(),
            saveAvatar: jest.fn(),
            deleteUserAvatar: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendUserCreationEmail: jest.fn(),
          },
        },
        {
          provide: RabbitMQService,
          useValue: {
            emitUserCreatedEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
  });

  describe('createUser', () => {
    it('should create a user and return success message', async () => {
      const createUserDto = { first_name: 'John Doe', email: 'john@example.com', avatar: null };
      const user = { id: '123', ...createUserDto };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest.spyOn(userService, 'createUser').mockResolvedValue(user);
      jest
        .spyOn(mailService, 'sendUserCreationEmail')
        .mockResolvedValue(undefined);
      jest
        .spyOn(rabbitMQService, 'emitUserCreatedEvent')
        .mockResolvedValue(undefined);

      await controller.createUser(createUserDto, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User created successfully',
        user,
      });
    });

    it('should handle errors', async () => {
      const createUserDto = {
        first_name: 'John Doe',
        email: 'john@example.com',
        avatar: null,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(userService, 'createUser')
        .mockRejectedValue(new Error('Error'));

      await controller.createUser(createUserDto, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error creating user',
        error: 'Error',
      });
    });
  });

  describe('getUser', () => {
    it('should get a user and return success message', async () => {
      const userId = '123';
      const user = { first_name: 'John Doe', email: 'john@example.com', avatar: null };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest.spyOn(userService, 'getUserById').mockResolvedValue(user);

      await controller.getUser(res, { params: { userId } } as any);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User fetched successfully',
        user,
      });
    });

    it('should handle errors', async () => {
      const userId = '123';
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(userService, 'getUserById')
        .mockRejectedValue(new Error('Error'));

      await controller.getUser(res, { params: { userId } } as any);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error fetching user',
        error: 'Error',
      });
    });
  });

  describe('uploadAvatar', () => {
    it('should upload and save the avatar successfully', async () => {
      const mockFile = {
        originalname: 'test-avatar.png',
        path: path.join(__dirname, '../../uploads/test-avatar.png'),
      } as Express.Multer.File;

      const userId = 'some-user-id';
      const base64Image = 'base64-image-string';

      jest.spyOn(userService, 'saveAvatar').mockResolvedValue(base64Image);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.uploadAvatar(userId, mockFile, res);

      expect(userService.saveAvatar).toHaveBeenCalledWith(userId, mockFile);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Avatar uploaded and saved successfully',
        image: base64Image,
      });
    });

    it('should handle file upload errors', async () => {
      const mockFile = null;
      const userId = 'some-user-id';

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.uploadAvatar(userId, mockFile, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No file uploaded',
      });
    });
  });
  describe('deleteUserAvatar', () => {
    it('should delete the user avatar successfully', async () => {
      const userId = 'some-user-id';

      jest.spyOn(userService, 'deleteUserAvatar').mockResolvedValue(undefined);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.deleteUserAvatar(userId, res);

      expect(userService.deleteUserAvatar).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User avatar deleted successfully',
      });
    });

    it('should handle errors when deleting avatar', async () => {
      const userId = 'some-user-id';
      jest
        .spyOn(userService, 'deleteUserAvatar')
        .mockRejectedValue(new Error('Error deleting avatar'));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.deleteUserAvatar(userId, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error deleting user avatar',
        error: 'Error deleting avatar',
      });
    });
  });
});