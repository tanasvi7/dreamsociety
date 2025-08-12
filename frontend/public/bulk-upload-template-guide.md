# Bulk Upload Template Guide

## Overview
This guide explains how to use the bulk upload template to add multiple users to the system with their complete profile information, including education, employment, and family details.

## Template Format
The template is in Excel (.xlsx) format and can be opened in Microsoft Excel, Google Sheets, LibreOffice Calc, or any compatible spreadsheet application.

## Required Fields (Must be filled)
- **full_name**: User's full name (e.g., "John Doe")
- **email**: Valid email address (e.g., "john.doe@example.com")
- **phone**: Phone number (10 digits only, e.g., "9876543210")
- **password**: User's password (will be hashed automatically)

## Optional Profile Fields
- **photo_url**: URL to user's profile photo (e.g., "https://example.com/photo.jpg")
- **dob**: Date of birth in YYYY-MM-DD format (e.g., "1990-05-15")
- **gender**: Must be one of: "male", "female", "other" (lowercase only)
- **village**: Village name (e.g., "Sample Village")
- **mandal**: Mandal name (e.g., "Sample Mandal")
- **district**: District name (e.g., "Hyderabad")
- **pincode**: Postal code (e.g., "500001")
- **caste**: Caste information (e.g., "General")
- **subcaste**: Subcaste information (e.g., "Sample Subcaste")
- **marital_status**: Marital status (e.g., "Single", "Married")
- **native_place**: Native place (e.g., "Hyderabad")

## Education Details (Up to 3 entries per user)
For each education entry (1, 2, or 3), include:
- **education_degree_X**: Degree name (e.g., "B.Tech", "M.Tech", "B.Sc")
- **education_institution_X**: Institution name (e.g., "JNTU Hyderabad")
- **education_year_of_passing_X**: Year of passing (e.g., "2012")
- **education_grade_X**: Grade or CGPA (e.g., "8.5 CGPA")

## Employment Details (Up to 3 entries per user)
For each employment entry (1, 2, or 3), include:
- **employment_company_name_X**: Company name (e.g., "TechCorp India")
- **employment_role_X**: Job role (e.g., "Software Engineer")
- **employment_years_of_experience_X**: Years of experience as decimal (e.g., "5.00", "3.50")
- **employment_currently_working_X**: Must be "true" or "false" (lowercase)

## Family Details (Up to 3 entries per user)
For each family member (1, 2, or 3), include:
- **family_name_X**: Family member's name (e.g., "Jane Doe")
- **family_relation_X**: Relationship (e.g., "Sister", "Father", "Husband")
- **family_education_X**: Family member's education (e.g., "B.Com", "MBA")
- **family_profession_X**: Family member's profession (e.g., "Accountant", "Manager")

## Important Notes

### Data Format Requirements:
1. **Gender**: Must be lowercase - "male", "female", or "other"
2. **Dates**: Use YYYY-MM-DD format (e.g., "1990-05-15")
3. **Boolean values**: Use "true" or "false" (lowercase) for currently_working fields
4. **Decimal numbers**: Use decimal format for years of experience (e.g., "5.00", "3.50")
5. **Email**: Must be a valid email format
6. **Phone**: Use exactly 10 digits (e.g., "9876543210")

### Validation Rules:
1. **Required fields**: full_name, email, phone, password cannot be empty
2. **Unique constraints**: email and phone must be unique across all users
3. **Education entries**: If you provide degree, institution, and year_of_passing, the entry will be created
4. **Employment entries**: If you provide company_name and role, the entry will be created
5. **Family entries**: If you provide name and relation, the entry will be created

### Tips for Success:
1. **Copy the sample data**: Use the provided sample rows as a template
2. **Leave empty cells**: For optional fields or unused education/employment/family entries, leave the cell empty
3. **Check data types**: Ensure dates, numbers, and boolean values are in the correct format
4. **Test with small data**: Start with a few rows to test before uploading large files
5. **Backup your data**: Keep a backup of your original data before uploading

### Common Errors to Avoid:
1. **Capitalized gender**: Use "male" not "Male"
2. **Wrong date format**: Use "1990-05-15" not "15/05/1990"
3. **Wrong boolean format**: Use "true"/"false" not "Yes"/"No"
4. **Invalid phone format**: Use exactly 10 digits for phone numbers
5. **Invalid email**: Ensure email format is correct
6. **Column count mismatch**: Ensure all data rows have exactly 48 columns (same as header)
7. **Missing commas**: Don't skip commas for empty fields - use empty values instead

## Template Features

### Excel Template Benefits:
- **Easy to use**: Open in Excel, Google Sheets, or any spreadsheet application
- **Proper formatting**: All columns are sized appropriately for data entry
- **Sample data**: Includes 3 complete example records to guide your data entry
- **Validation ready**: Compatible with Excel's data validation features
- **Professional layout**: Clean, organized structure for efficient data entry

### Sample Data Included:
The template includes 3 complete sample records showing:
- Complete user profiles with all required and optional fields
- Multiple education entries per user
- Multiple employment entries per user  
- Multiple family member entries per user
- Proper data formatting examples

## Excel Formatting Best Practices

### Column Count Consistency:
- **Header row**: 51 columns
- **Data rows**: Must have exactly 51 columns each
- **Empty fields**: Leave cells empty (no text) for missing data
- **Column formatting**: All columns are properly sized for easy data entry

### Common Excel Issues:
1. **Missing columns**: Ensure all 51 columns are present
2. **Extra columns**: Don't add extra columns
3. **Data validation**: Use the provided dropdowns and validation rules
4. **Cell formatting**: Keep text formatting simple, avoid complex formulas

## Support
If you encounter any issues with the bulk upload, please check:
1. All required fields are filled
2. Data formats are correct
3. Email and phone numbers are unique
4. File is saved in Excel (.xlsx) format
5. All rows have exactly 51 columns
6. No missing columns or extra columns 