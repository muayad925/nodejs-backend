// import bcrypt from "bcrypt";
// import jwt, { type Secret } from "jsonwebtoken";
// import { UserRepository } from "../repositories/userRepository.js";
// import { TokenRepository } from "../repositories/tokenRepository.js";
// import { emailQueue, type WelcomeJob } from "../queues/emailQueue.js";
// import { stripe } from "../config/stripe.js";
// import prisma from "../config/db.js";

// const accessSecret = process.env.JWT_ACCESS_SECRET!;
// const refreshSecret = process.env.JWT_REFRESH_SECRET!;
// const accessExpiry = "15m";
// const refreshExpiry = "7d";

// export class AuthService {
//   private userRepo = new UserRepository();
//   private tokenRepo = new TokenRepository();

//   async register(
//     firstName: string,
//     lastName: string,
//     gender: string,
//     email: string,
//     password: string
//   ) {
//     const existing = await this.userRepo.findByEmail(email);
//     if (existing) throw new Error("Email already in use");

//     const hashed = await bcrypt.hash(password, 12);
//     const user = await this.userRepo.create({
//       firstName,
//       lastName,
//       gender,
//       email,
//       password: hashed,
//     });
//     const stripeCustomer = await stripe.customers.create({
//       email: user.email,
//       name: `${user.firstName} ${user.lastName}`,
//       metadata: { userId: user.id }, // helps cross-reference later
//     });
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { stripeCustomerId: stripeCustomer.id },
//     });

//     const jobData: WelcomeJob = { userId: user.id, email, name: firstName };
//     await emailQueue.add("welcomeEmail", jobData);

//     const tokens = this.generateTokens({ userId: user.id });
//     await this.tokenRepo.create(user.id, tokens.refreshToken);

//     return { user: { id: user.id, email: user.email }, tokens };
//   }

//   async login(email: string, password: string) {
//     const user = await this.userRepo.findByEmail(email);
//     if (!user) throw new Error("Invalid credentials");

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) throw new Error("Invalid credentials");

//     const tokens = this.generateTokens({ userId: user.id, role: user.role });
//     await this.tokenRepo.create(user.id, tokens.refreshToken);

//     return {
//       user: { id: user.id, email: user.email, role: user.role },
//       tokens,
//     };
//   }

//   async refresh(refreshToken: string) {
//     if (!refreshToken) throw new Error("Missing token");

//     let payload: any;
//     try {
//       payload = jwt.verify(refreshToken, refreshSecret);
//     } catch {
//       throw new Error("Invalid token");
//     }

//     const tokenExists = await this.tokenRepo.find(payload.userId, refreshToken);
//     if (!tokenExists) throw new Error("Token revoked");

//     const tokens = this.generateTokens({ userId: payload.userId });
//     await this.tokenRepo.create(payload.userId, tokens.refreshToken);
//     await this.tokenRepo.delete(payload.userId, refreshToken); // rotate

//     return tokens;
//   }

//   async logout(userId: number, refreshToken: string) {
//     await this.tokenRepo.delete(userId, refreshToken);
//   }

//   private generateTokens(payload: object) {
//     const accessToken = jwt.sign(payload, accessSecret as Secret, {
//       expiresIn: accessExpiry,
//     });
//     const refreshToken = jwt.sign(payload, refreshSecret as Secret, {
//       expiresIn: refreshExpiry,
//     });
//     return { accessToken, refreshToken };
//   }
// }
