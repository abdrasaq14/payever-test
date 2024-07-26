import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserDoc } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  // Define the directory where the avatar images will be stored
  private readonly avatarDir = path.join(__dirname, '../../', 'uploads');

  constructor(
    @InjectModel('UserModel') private readonly userModel: Model<IUserDoc>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<IUserDoc> {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async getUserById(userId: string): Promise<IUserDoc> {
    return await this.userModel.findById(userId).exec();
  }

  async getAvatar(userId: string): Promise<string> {
    const user = await this.getUserById(userId);
    if (!user || !user.avatar) {
      throw new Error('Avatar not found');
    }

    const avatarPath = path.join(this.avatarDir, user.avatar);
    const fileBuffer = await fs.readFile(avatarPath);
    return fileBuffer.toString('base64');
  }

  async saveAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    const fileBuffer = await fs.readFile(file.path);

    // Computing the hash of the file buffer
    const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const fileName = `${hash}.png`;
    const filePath = path.join(this.avatarDir, fileName);

    // Saving the file with the hashed filename
    await fs.writeFile(filePath, fileBuffer);

    await this.userModel.findByIdAndUpdate(userId, { avatar: fileName });

    // Converting the file to base64
    const base64Image = fileBuffer.toString('base64');

    return base64Image;
  }
  async deleteUserAvatar(userId: string): Promise<void> {
    // Find the user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.avatar) {
      const filePath = path.join(this.avatarDir, user.avatar);
      await fs.unlink(filePath);
    }

    user.avatar = null; 
    await user.save();
  }
}
