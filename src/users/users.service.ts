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
import { Recipes } from './interfaces/recipe.interface';
import { DataYear } from './interfaces/recipe.interface';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
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

      return {
        ...user,
        token: this.#getJwtToken({
          id: user.id,
          name: user.name,
        }),
      };
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
    const { importantPhones, completeForm, ...restOfUpdateUserDto } =
      updateUserDto;
    if (importantPhones) {
      const check = importantPhones.some((phone) => {
        //const aux = JSON.parse(phone.toString());
        return !phoneType.includes(phone.type);
      });
      if (check) {
        throw new BadRequestException('Type Phone not valid');
      }
    }
    const user = await this.userRepository.preload({
      id,
      importantPhones,
      ...restOfUpdateUserDto,
    });

    if (!user) throw new NotFoundException(`User with id: ${id} not found`);

    const keysForm = Object.keys(completeForm || {});
    keysForm.forEach((keyForm) => {
      if (keyForm == 'recipes') {
        const recipes = completeForm[keyForm];
        const keysRecipes = Object.keys(recipes);
        const userRecipes: Recipes = user.completeForm.recipes || {};
        keysRecipes.forEach((keyRecipe) => {
          if (!isUUID(keyRecipe)) {
            userRecipes[uuid()] = recipes[keyRecipe];
          } else {
            this.#updateCompleteFormDataYear(
              userRecipes[keyRecipe].dataYear,
              recipes[keyRecipe].dataYear,
            );
          }
        });
        user.completeForm.recipes = userRecipes;
      } else {
        user.completeForm[keyForm] = user.completeForm[keyForm] || {};
        this.#updateCompleteFormDataYear(
          user.completeForm[keyForm],
          completeForm[keyForm],
        );
      }
    });

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

  #updateCompleteFormDataYear(
    dataYearToUpdate: DataYear<any>,
    dataYearUpdate: DataYear<any>,
  ) {
    const years = Object.keys(dataYearUpdate);
    years.forEach((year) => {
      if (!dataYearToUpdate[year]) {
        dataYearToUpdate[year] = dataYearUpdate[year];
        return;
      }
      const months = Object.keys(dataYearUpdate[year]);
      months.forEach((month) => {
        if (!dataYearToUpdate[year][month]) {
          dataYearToUpdate[year][month] = dataYearUpdate[year][month];
          return;
        }
        const days = Object.keys(dataYearUpdate[year][month]);
        days.forEach((day) => {
          dataYearToUpdate[year][month][day] = dataYearUpdate[year][month][day];
        });
      });
    });
  }

  #getJwtToken(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
