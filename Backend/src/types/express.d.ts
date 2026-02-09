import { User as UserEntity } from '../entities/User';

declare global {
  namespace Express {
    interface User extends UserEntity {}
    
    interface Request {
      user?: UserEntity;
      isAdmin?: boolean;
    }
  }
}

export {};
