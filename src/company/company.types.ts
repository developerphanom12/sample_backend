import { AuthEntity } from "src/auth/entities/auth.entity";
import { CompanyEntity } from "./entities/company.entity";

export interface ICreateCompany {
    company: CompanyEntity,
    user: AuthEntity,
  }