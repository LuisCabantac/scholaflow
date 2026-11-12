export type PasswordChangeFields = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type PasswordChangeError =
  | "mismatch"
  | "tooShort"
  | "tooLong"
  | "currentRequired";
