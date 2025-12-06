import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../auth/roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponse } from './dto/user-response.dto';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const exists = await this.userRepository.existsBy({
      email: createUserDto.email,
    });
    if (exists) {
      throw new BadRequestException('User with this email already exists');
    }
    const { password, ...restData } = createUserDto;
    const user = this.userRepository.create({
      passwordHash: password,
      ...restData,
    });
    const savedUser = await this.userRepository.save(user);
    return new UserResponse(savedUser);
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    items: UserResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [items, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((user) => new UserResponse(user)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<UserResponse> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return new UserResponse(user);
  }

  async findEntity(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    return new UserResponse(updatedUser);
  }

  async updateRole(
    id: number,
    role: UserRole,
    user: { userId: number; role: UserRole },
  ): Promise<UserResponse> {
    if (role === UserRole.ADMIN) {
      throw new ForbiddenException('You cannot make other user admin');
    }

    const targetUser = await this.userRepository.findOneBy({ id });
    if (!targetUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (targetUser.role === UserRole.ADMIN && targetUser.id !== user.userId) {
      throw new ForbiddenException(
        'You cannot change the role of another admin',
      );
    }

    targetUser.role = role;
    const updatedUser = await this.userRepository.save(targetUser);
    return new UserResponse(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.remove(user);
  }
}
