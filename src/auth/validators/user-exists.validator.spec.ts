import { Test, type TestingModule } from '@nestjs/testing';
import { useContainer, validate, Validate } from 'class-validator';
import { createMock } from 'ts-auto-mock';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

import { IsUserAlreadyExist } from './user-exists.validator';
import { User } from '../../entities/user.entity';

class UserDTO {
  @Validate(IsUserAlreadyExist)
  readonly email: string;

  constructor(email: string) {
    this.email = email;
  }
}

describe('IsUserAlreadyExist', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IsUserAlreadyExist],
    })
      .useMocker((token) => {
        if (Object.is(token, getModelToken(User.name))) {
          return createMock<Model<User>>({
            findOne: jest
              .fn()
              .mockImplementation((criteria: { email: string }) => {
                if (criteria.email === 'john@doe.me') {
                  return createMock<User>();
                }
                return null;
              }),
          });
        }
      })
      .compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  it.each([
    ['john@doe.me', 1],
    ['newuser@example.com', 0],
  ])(
    'should validate whether the user already exists by their email',
    async (email, errors) => {
      const user = new UserDTO(email);

      await expect(validate(user)).resolves.toHaveLength(errors);
    },
  );
});
