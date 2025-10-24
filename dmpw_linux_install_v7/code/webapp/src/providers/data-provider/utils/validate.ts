// Email validation function with optional translator
export const validateEmail = (_: any, value: string, t?: (key: string) => string) => {
  if (!value) {
    const message = t ? t('validation.email.required') : 'Nhập email';
    return Promise.reject(new Error(message));
  }

  // Email regex pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(value)) {
    const message = t ? t('validation.email.invalid') : 'Email không đúng định dạng';
    return Promise.reject(new Error(message));
  }

  return Promise.resolve();
};

// Password validation function with dynamic security settings and optional translator
export const validatePasswordWithSettings = (
  value: string,
  settings?: {
    haveUpperCase?: boolean;
    haveNumber?: boolean;
    haveSpecial?: boolean;
  },
  t?: (key: string) => string
) => {
  if (!value) {
    const message = t ? t('validation.password.required') : 'Mật khẩu không được phép để trống';
    return Promise.reject(new Error(message));
  }

  // Check for spaces anywhere in password
  if (/\s/.test(value)) {
    const message = t ? t('users.validation.password.noSpaces') : 'Mật khẩu không được chứa khoảng trắng';
    return Promise.reject(new Error(message));
  }

  // Check length (8-16 characters)
  if (value.length < 8) {
    const message = t ? t('validation.password.minLength') : 'Mật khẩu phải có từ ít nhất 8 ký tự';
    return Promise.reject(new Error(message));
  }

  // Check uppercase letter if required
  if (settings?.haveUpperCase && !/[A-Z]/.test(value)) {
    const message = t ? t('validation.password.requireUppercase') : 'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa';
    return Promise.reject(new Error(message));
  }

  // Check number if required
  if (settings?.haveNumber && !/[0-9]/.test(value)) {
    const message = t ? t('validation.password.requireNumber') : 'Mật khẩu phải chứa ít nhất 1 chữ số';
    return Promise.reject(new Error(message));
  }

  // Check special character if required
  if (settings?.haveSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(value)) {
    const message = t ? t('validation.password.requireSpecial') : 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt';
    return Promise.reject(new Error(message));
  }

  return Promise.resolve();
};

// Legacy password validation function (for backward compatibility)
export const validatePassword = (_: any, value: string) => {
  // Use default settings for backward compatibility
  return validatePasswordWithSettings(value, {
    haveUpperCase: true,
    haveNumber: false,
    haveSpecial: true,
  });
};