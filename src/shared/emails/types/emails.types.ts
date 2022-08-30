export interface IInviteMember {
  token?: string;
  memberEmail?: string;
  email: string;
  name: string;
  host_url: string;
  companyNames: string[];
  avatarSrc: any;
}

export interface IInviteCompanyOwner
  extends Omit<IInviteMember, 'memberEmail' | 'companyNames'> {}
