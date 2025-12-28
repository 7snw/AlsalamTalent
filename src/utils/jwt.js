import jwtDecode from 'jwt-decode';

export function getUserFromToken(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}
