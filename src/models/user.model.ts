export class User {
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }

}
