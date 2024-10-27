import { readFileSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import { EnvVault } from './env.vault';

export class KeyVault {
  static ACCESS_TOKEN_SECRET_PATH: string = readFileSync(
    join(cwd(), EnvVault.ACCESS_TOKEN_SECRET_PATH),
  ).toString('utf-8');

  static REFRESH_TOKEN_SECRET_PATH: string = readFileSync(
    join(cwd(), EnvVault.REFRESH_TOKEN_SECRET_PATH),
  ).toString('utf-8');
}