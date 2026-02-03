import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOrCreateByClientUuid(clientUuid: string): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { client_uuid: clientUuid },
    });

    if (!user) {
      user = this.userRepository.create({ client_uuid: clientUuid });
      user = await this.userRepository.save(user);
    } else {
      // Update last_active
      user.last_active = new Date();
      await this.userRepository.save(user);
    }

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByClientUuid(clientUuid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { client_uuid: clientUuid } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getCount(): Promise<number> {
    return this.userRepository.count();
  }
}
