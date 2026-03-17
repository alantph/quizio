import bcrypt from "bcryptjs";
import { User, IUser } from "@quizio/socket/db/models/user";

export const userService = {
  async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username }).lean() as any;
  },

  async createUser(username: string, password: string): Promise<IUser> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, passwordHash, role: "admin" });
    return user.save();
  },

  async verifyPassword(user: IUser, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  },

  async listUsers(): Promise<
    { id: string; username: string; role: string; createdAt: Date }[]
  > {
    const users = await User.find().lean();
    return users.map((u) => ({
      id: u._id.toString(),
      username: u.username,
      role: u.role,
      createdAt: u.createdAt,
    }));
  },

  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  },

  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = await User.findByIdAndUpdate(id, { passwordHash });
    return !!result;
  },
};
