declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: number;
        name: string;
        iat: number;
        exp: number;
      };
    }
  }
}

export {};
