import { jwtService } from "../services/jwt.service.js";
import { tokenService } from "../services/token.service.js";
import { userService } from "../services/user.service.js";

export const sendAuthentication = async (res, user) => {
  const normalizedUser = userService.normalize(user);
  const { accessToken, refreshToken } = jwtService.sign(normalizedUser);
  
  await tokenService.save(user.id, refreshToken);
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 1000,
  });
  
  res.send({
    user: normalizedUser,
    accessToken,
  });
};
