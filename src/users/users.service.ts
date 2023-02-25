import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm'; //!connection pool
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { phoneType } from './interfaces/phoneType.interface';
import { v4 as uuid } from 'uuid';
import { isUUID } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    //const newUser = this.userRepository.create(createUserDto);
    //return this.userRepository.save(newUser);

    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;

      return user;
    } catch (error) {
      this.#handleDBExceptions(error);
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { importantPhones, recipes, ...restOfUpdateUserDto } = updateUserDto;
    if (importantPhones) {
      const check = importantPhones.some((phone) => {
        //const aux = JSON.parse(phone.toString());
        return !phoneType.includes(phone.type);
      });
      if (check) {
        throw new BadRequestException('Type Phone not valid');
      }
    }
    //const user = await this.userRepository.preload({ id, ...updateUserDto });
    const user = await this.userRepository.preload({
      id,
      importantPhones,
      recipes,
      ...restOfUpdateUserDto,
    });

    if (!user) throw new NotFoundException(`User with id: ${id} not found`);
    /*if (recipes) {
      //TODO
      const keysRecipes = Object.keys(recipes);
      const jsonUserRecipes = JSON.parse(String(user.recipes));
      keysRecipes.forEach((keyRecipe) => {
        if (!isUUID(keyRecipe)) {
          jsonUserRecipes[uuid()] = recipes[keyRecipe];
        } else {
          jsonUserRecipes[keyRecipe];
        }
        //actualizar
        //user.recipes.id => recipes.id
      });
    }
    throw new NotFoundException(`User with id: ${id} not found`);*/
    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.#handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    await this.update(id, { isActive: false });
    return `This action removes a #${id} user`;
  }

  #handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
