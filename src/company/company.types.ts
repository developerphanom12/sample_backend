import { AuthEntity } from "src/auth/entities/auth.entity";
import { MemberEntity } from "src/company-member/entities/company-member.entity";
import { CompanyEntity } from "./entities/company.entity";

export interface ICreateCompany {
    account: MemberEntity,
    company: CompanyEntity,
    user: AuthEntity,
  }