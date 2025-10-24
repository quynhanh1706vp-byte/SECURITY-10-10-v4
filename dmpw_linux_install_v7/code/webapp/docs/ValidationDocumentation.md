# DeMasterProCloud API Validation Documentation

This document provides a comprehensive overview of all validation definitions in the DeMasterProCloud API Infrastructure.

## Base Validation

### BaseValidation<T>
**File**: `BaseValidation.cs:10`
- **Purpose**: Abstract base validation class containing common validation methods
- **Protected Methods**:
  - `ContainsOnlySafeCharacters(string input)`: Checks for safe characters using `Helpers.ContainsOnlyLettersAndDigits()` and `!Helpers.ContainsCode()`
  - `NotContainsCode(string input)`: Ensures input doesn't contain code using `!Helpers.ContainsCode()`

## Validation Classes Overview

### 1. AccessGroupValidation
**File**: `AccessGroupValidation.cs:12`
**Model**: `AccessGroupModel`
**API URLs**: `/access-groups`, `/access-groups/{id}`
**Rules**:
- **Name**:
  - Not empty (required)
  - Max length: 100 characters
  - Must not exist (duplicate check via service)
  - Must contain only safe characters

### 2. AccessScheduleValidation
**File**: `AccessScheduleValidation.cs:8`
**Model**: `AccessScheduleModel`
**API URLs**: `/access-schedules`, `/access-schedules/{id}`
**Rules**:
- **Content**:
  - Not empty (required)
  - Max length: 1000 characters
  - Must not contain code

### 3. AccessTimeValidation
**File**: `AccessTimeValidation.cs:12`
**Model**: `AccessTimeModel`
**API URLs**: `/access-times`, `/access-times/{id}`
**Rules**:
- **Name**:
  - Not empty (required)
  - Max length: 50 characters
  - Must not exist (duplicate check via service)
  - Must not contain code
- **Remarks**:
  - Max length: 1000 characters
  - Must not contain code

### 4. AccountValidation
**File**: `AccountValidation.cs:16`
**Model**: `AccountModel`
**API URLs**: `/accounts`, `/accounts/{id}`, `/accounts/reset-password`, `/accounts/forgot-password`, `/accounts/change-password`
**Rules**:
- **Password**:
  - Not empty (when Id == 0 and Role != 0)
  - Min length: 8 characters
  - Max length: 50 characters
- **ConfirmPassword**:
  - Not empty (when Id == 0 and Role != 0)
  - Min length: 6 characters
  - Max length: 50 characters
  - Must equal Password
- **TimeZone**:
  - Max length: 100 characters
  - Must be valid timezone (via `Helpers.IsValidTimeZone()`)
  - Must contain only safe characters

#### Additional Account Validations:

#### ForgotPasswordValidation
**File**: `AccountValidation.cs:81`
**Model**: `ForgotPasswordModel`
**API URLs**: `/accounts/forgot-password`
**Rules**:
- **Email**:
  - Not empty (required)
  - Valid email format
  - Max length: 50 characters
  - Must contain only safe characters

#### ResetPasswordValidation
**File**: `AccountValidation.cs:102`
**Model**: `ResetPasswordModel`
**API URLs**: `/accounts/reset-password`
**Rules**:
- **NewPassword**:
  - Not empty (required)
  - Min length: 6 characters
  - Max length: 50 characters
- **ConfirmNewPassword**:
  - Not empty (required)
  - Min length: 6 characters
  - Max length: 50 characters
  - Must equal NewPassword
- **Token**: Not empty (required)

#### ChangePasswordModelValidation
**File**: `AccountValidation.cs:126`
**Model**: `ChangePasswordModel`
**API URLs**: `/accounts/change-password-no-login`
**Rules**:
- **NewPassword**:
  - Not empty (required)
  - Min length: 6 characters
  - Max length: 50 characters
  - Must not equal current Password
- **ConfirmNewPassword**:
  - Not empty (required)
  - Min length: 6 characters
  - Max length: 50 characters
  - Must equal NewPassword
- **Password**: Not empty (required)

#### ChangePasswordLoginModelValidation
**File**: `AccountValidation.cs:161`
**Model**: `ChangePasswordLoginModel`
**API URLs**: `/accounts/change-password`
**Rules**:
- **NewPassword**:
  - Not empty (required)
  - Min length: 6 characters
  - Max length: 50 characters
- **ConfirmNewPassword**:
  - Not empty (required)
  - Min length: 6 characters
  - Max length: 50 characters
  - Must equal NewPassword

### 5. BuildingValidation
**File**: `BuildingValidation.cs:12`
**Model**: `BuildingModel`
**API URLs**: `/buildings`, `/buildings/{id}`
**Rules**:
- **Name**:
  - Not empty (required)
  - Max length: 50 characters
  - Must not exist (duplicate check via service)
  - Must contain only safe characters
- **Address**:
  - Max length: 100 characters
  - Must not contain code

### 6. CameraValidation
**File**: `CameraValidation.cs:8`
**Model**: `CameraModel`
**API URLs**: `/cameras`, `/cameras/{id}`
**Rules**:
- **CameraId**:
  - Not empty (required)
  - Max length: 50 characters
  - Must contain only safe characters
- **Name**:
  - Not empty (required)
  - Max length: 100 characters
  - Must contain only safe characters
- **VideoLength**: Must be greater than 0

### 7. CardValidation
**File**: `CardValidation.cs:16`
**Model**: `CardModel`
**API URLs**: `/users/{id}/identification`, `/visits/{id}/identification`
**Rules**:
- **CardId**:
  - Not empty (when CardType is NFC)
  - Max length: 40 characters
- **IssueCount**:
  - Range: 0-100 inclusive
  - Must be integer type
- **FingerPrintData**: Complex validation for fingerprint templates (must not be null/empty if provided)

### 8. CompanyValidation
**File**: `CompanyValidation.cs:15`
**Model**: `CompanyModel`
**API URLs**: `/company/{id}`
**Rules**:
- **Name**:
  - Not empty (required)
  - Max length: 100 characters
  - Must contain only safe characters
- **Logo**: Must be valid image format (when provided)
- **MiniLogo**: Must be valid image format (when provided)

### 9. DepartmentValidation
**File**: `DepartmentValidation.cs:12`
**Model**: `DepartmentModel`
**API URLs**: `/departments`, `/departments/{id}`
**Rules**:
- **Name**:
  - Not empty (required)
  - Max length: 100 characters
  - Must not exist (duplicate check via service)
  - Must contain only safe characters
- **Number**:
  - Max length: 20 characters
  - Must not exist if provided (duplicate check via service)
  - Must contain only safe characters

### 10. DeviceReaderValidation
**File**: `DeviceReaderValidation.cs:12`
**Model**: `DeviceReaderModel`
**API URLs**: `/device-readers`, `/device-readers/{id}`
**Rules**:
- **Name**:
  - Not empty (required)
  - Max length: 50 characters
  - Must not exist (duplicate check via service)

### 11. DeviceValidation
**File**: `DeviceValidation.cs:15`
**Model**: `DeviceModel`
**API URLs**: `/devices`, `/devices/{id}`, `/devices/config/local-mqtt`
**Rules**:
- **DeviceAddress**:
  - Not empty (required)
  - Max length: 20 characters
  - Must not exist (duplicate check via service)
  - Must not contain code
- **DoorName**:
  - Not empty (required)
  - Max length: 100 characters
  - Must not contain code
- **VerifyMode**: Must be able device verify (via service)
- **MPRCount**: Range 1-10 inclusive
- **MPRInterval**: Range 1-180 inclusive
- **LockOpenDuration**: Range 1-254 inclusive
- **SensorDuration**: Range 1-254 inclusive (when Alarm is true)
- **RoleReader1**: Must be different from RoleReader0 (for specific device types)

#### ConfigLocalMqttModelValidation
**File**: `DeviceValidation.cs:90`
**Model**: `ConfigLocalMqttModel`
**API URLs**: `/devices/config/local-mqtt`
**Rules**:
- **LocalMqtt.Host**:
  - Max length: 19 characters
  - Must not contain code
- **LocalMqtt.UserName**:
  - Max length: 9 characters
  - Must not contain code
- **LocalMqtt.Password**:
  - Max length: 9 characters
  - Must not contain code

### 12. EventLogValidation
**File**: `EventLogValidation.cs:15`
**Model**: `EventLogAccessTimeModel`
**API URLs**: `/event-logs/recovery`
**Rules**:
- **AccessDateFrom**: Must be valid date format
- **AccessDateTo**: Must be valid date format
- **AccessTimeFrom**: Must be valid time format
- **AccessTimeTo**: Must be valid time format

### 13. HolidayValidation
**File**: `HolidayValidation.cs:14`
**Model**: `HolidayModel`
**API URLs**: `/holidays`, `/holidays/{id}`
**Rules**:
- **Name**:
  - Not empty (required)
  - Max length: 50 characters
  - Must not exist (duplicate check via service)
  - Must contain only safe characters
- **StartDate**:
  - Not empty (required)
  - Must be valid date format
  - Must not overlap with existing holidays
- **EndDate**:
  - Not empty (required)
  - Must be valid date format
  - Must be greater than StartDate
- **Type**: Must be greater than 0
- **Remarks**:
  - Max length: 1000 characters
  - Must not contain code

#### HolidaysValidation
**File**: `HolidayValidation.cs:73`
**Model**: `List<HolidayModel>`
**API URLs**: `/holidays` (bulk operations)
**Rules**: Each item validated with HolidayValidation rules

### 14. LoginValidation
**File**: `LoginValidation.cs:9`
**Model**: `LoginModel`
**API URLs**: `/login`, `/login-step2`
**Rules**:
- **Username**: Not empty (required)
- **Password**: Not empty (required)

### 15. RoleValidation
**File**: `RoleValidation.cs:13`
**Model**: `RoleModel`
**API URLs**: `/roles`, `/roles/{id}`
**Rules**:
- **RoleName**:
  - Not empty (required)
  - Max length: 100 characters
  - Must not exist (duplicate check via service)
  - Must contain only safe characters
- **Description**:
  - Max length: 1000 characters
  - Must not contain code

### 16. SettingValidation
**File**: `SettingValidation.cs:11`
**Model**: `SettingModel`
**API URLs**: `/settings`, `/settings/{id}`
**Rules**:
- **Value**: Not empty (required)

### 17. SystemLogValidation
**File**: `SystemLogValidation.cs:31`
**API URLs**: `/system-logs`, `/system-logs/report`

#### ReportValidation
**Model**: `EventLogViewModel`
**API URLs**: `/event-logs/report`
**Rules**:
- **AccessTimeTo**: Must match time regex pattern (12-hour AM/PM format)
- **AccessTimeFrom**: Must match time regex pattern (12-hour AM/PM format)

#### SystemLogValidation
**Model**: `SystemLogModel`
**API URLs**: `/system-logs`
**Rules**:
- **OpeTimeTo**: Must match time regex pattern (12-hour AM/PM format)
- **OpeTimeFrom**: Must match time regex pattern (12-hour AM/PM format)
- **OpeDateFrom**: Must be valid date format
- **OpeDateTo**: Must be valid date format

#### SystemLogOperationTimeValidation
**File**: `SystemLogValidation.cs:57`
**Model**: `SystemLogOperationTime`
**API URLs**: `/system-logs/operation-time`
**Rules**:
- **OpeDateFrom**: Must be valid date format
- **OpeDateTo**: Must be valid date format
- **OpeTimeFrom**: Must be valid date format
- **OpeTimeTo**: Must be valid date format

### 18. UserValidation
**File**: `UserValidation.cs:16`
**Model**: `UserModel`
**API URLs**: `/users`, `/users/{id}`, `/users-multi`
**Rules**:
- **Address**:
  - Max length: 100 characters
  - Must not contain code
- **DepartmentId**: Not empty (required)
- **AccessGroupId**: Not empty (required)
- **UserCode**:
  - Max length: 30 characters
  - Must not be duplicated (via service)
- **EffectiveDate**: Must be valid date format
- **ExpiredDate**:
  - Must be valid date format
  - Must be greater than or equal to EffectiveDate
- **FirstName**:
  - Not empty (required)
  - Max length: 100 characters
  - Must not contain code
- **BirthDay**:
  - Must be valid date format (when provided)
  - Must be in the past (when provided)
- **Nationality**: Max length: 100 characters
- **City**: Max length: 100 characters
- **Position**:
  - Max length: 100 characters
  - Must not contain code
- **PostCode**: Max length: 20 characters
- **HomePhone**: Max length: 20 characters
- **OfficePhone**: Max length: 20 characters

#### RegisterUserModelValidation
**File**: `UserValidation.cs:132`
**Model**: `RegisterUserModel`
**API URLs**: `/users/register/{companyCode}`
**Rules**:
- **FirstName**: Not empty (required)
- **HomePhone**: Not empty (required)

### 19. VehicleValidation
**File**: `VehicleValidation.cs:8`
**Model**: `VehicleModel`
**API URLs**: `/vehicles`, `/vehicles/{id}`, `/users/{id}/vehicles`, `/visits/{id}/vehicles`
**Rules**:
- **PlateNumber**:
  - Not empty (required)
  - Max length: 15 characters
  - Must contain only safe characters
- **Color**:
  - Max length: 50 characters
  - Must contain only safe characters
- **Model**:
  - Max length: 50 characters
  - Must contain only safe characters

### 20. VisitValidation
**File**: `VisitValidataion.cs:13`
**Model**: `VisitModel`
**API URLs**: `/visits`, `/visits/{id}`, `/visits/pre-register`
**Rules**:
- **VisitorName**:
  - Not empty (required)
  - Max length: 100 characters
  - Must contain only safe characters
- **BirthDay**: Must be valid date format (DD/MM/YYYY)
- **VisitorDepartment**: Must contain only safe characters (when provided)
- **StartDate**: Must be valid datetime format
- **EndDate**:
  - Must be valid datetime format
  - Must be greater than StartDate
- **VisiteeId**: Must exist in system (when provided and not 0)

#### VisitOperationTimeValidation
**File**: `VisitValidataion.cs:75`
**Model**: `VisitOperationTime`
**API URLs**: `/visits/report` (filtering)
**Rules**:
- **OpeDateFrom**: Not empty (required)
- **OpeDateTo**: Not empty (required)

### 21. WorkShiftValidation
**File**: `WorkShiftValidation.cs:14`
**Model**: `WorkShiftModel`
**API URLs**: `/work-shifts`, `/work-shifts/{id}`
**Rules**:
- **Name**:
  - Not empty (required)
  - Must not exist (duplicate check via service)
  - Max length: 1000 characters
  - Must not contain code
- **StartTime**:
  - Not empty (required)
  - Must match time format regex (HH:MM, 24-hour format)
- **EndTime**:
  - Not empty (required)
  - Must match time format regex (HH:MM, 24-hour format)
  - Must be greater than StartTime

## Common Validation Patterns

### Security Validations
- **Safe Characters**: Most string fields use `ContainsOnlySafeCharacters()` validation
- **Code Injection Protection**: Many fields use `NotContainsCode()` validation
- **Input Sanitization**: Fields are trimmed before validation in many cases

### Date/Time Validations
- **Date Format**: Custom date format validation using `DateTimeHelper.IsDateTime()`
- **Time Format**: Regex-based time validation (both 12-hour and 24-hour formats)
- **Date Comparison**: Custom validation for date range validations

### Duplication Prevention
- Most entities check for duplicate names/codes using service-layer validation
- Route-based ID extraction for edit operations to exclude current record

### Length Restrictions
- Consistent max length validation across similar field types
- Different length limits based on field purpose (names: 50-100, descriptions: 1000)

## Error Message Resources
All validation error messages use centralized resource files:
- `MessageResource` for common validation messages
- Entity-specific resources (e.g., `UserResource`, `CompanyResource`) for entity-specific messages

## Dependencies
- **FluentValidation**: Primary validation framework
- **IHttpContextAccessor**: For route-based ID extraction
- **Configuration**: For application settings (image types, etc.)
- **Service Layer**: For business rule validation (duplicates, references)
- **Helpers**: Common utility methods for validation logic