import { CompanyEntity } from 'src/company/entities/company.entity';
import { CurrencyEntity } from 'src/currency/entities/currency.entity';
import { AuthEntity } from './entities/auth.entity';
import { SocialAuthEntity } from './entities/social-auth.entity';

export interface ILogin {
  user: AuthEntity;
  socialAccount: SocialAuthEntity | null;
  token: string;
  refreshToken?: string;
  company: CompanyEntity | null;
  currencies: CurrencyEntity[];
  showSetPassword?: boolean;
}
