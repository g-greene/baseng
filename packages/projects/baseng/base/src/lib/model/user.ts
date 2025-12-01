export interface User {
  userId: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  groups: string[];
  isAuthenticated: boolean;
  astat?: any;
}
