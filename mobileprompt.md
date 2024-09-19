 # Mobile Development Prompt for School Management System

This document serves as the central reference for creating and maintaining components in the School Management System Mobile project using React Native. It outlines the structure, best practices, and guidelines to be followed throughout the project.

## Project Structure

1. Screens: `src/Screens/[ScreenName]/`
2. Reusable components: `src/Components/`
3. Common components: `src/Components/common/`
4. Screen-specific components: `src/Screens/[ScreenName]/components/`
5. Interfaces: `src/Screens/[ScreenName]/Interfaces/`
6. Services: `src/Screens/[ScreenName]/Services/`
7. Utilities: `src/utils/`
8. Prompts: `src/Prompts/`

## Coding Standards

1. Use TypeScript for all components and files
2. Follow React Native functional component pattern with hooks
3. Use React Native Paper for UI components
4. Implement responsive design using React Native's flexbox and dimensions
5. Use ESLint and Prettier for code formatting and linting

## Component Creation Guidelines

1. Create separate files for each component
2. Use PascalCase for component names and filenames
3. Use arrow function syntax for functional components
4. Define prop interfaces for components
5. Use React.FC type for functional components
6. Implement error boundaries where necessary

## State Management

1. Use React hooks (useState, useEffect) for local state management
2. Consider using Context API for global state if needed
3. Implement custom hooks for reusable logic

## Navigation

1. Use React Navigation for screen navigation
2. Implement stack, tab, and drawer navigation as needed

## API Integration

1. Use Axios for API calls
2. Create a centralized API service for managing requests
3. Implement error handling and loading states for API calls

## Authentication

1. Implement JWT-based authentication
2. Store tokens securely using AsyncStorage or a more secure alternative
3. Create protected routes for authenticated users

## Form Handling

1. Use React Native Paper Form components
2. Implement form validation using a library like Formik or custom validation rules

## Modal and Popup Handling

1. Use React Native Modal component for popups
2. Create reusable modal components when necessary

## Error Handling

1. Implement global error handling
2. Use try-catch blocks for async operations
3. Display user-friendly error messages using React Native Paper Snackbar or custom components

## Performance Optimization

1. Use React.memo for pure functional components
2. Implement virtualization for long lists (e.g., using FlatList)
3. Optimize images and assets

## Accessibility

1. Follow React Native accessibility guidelines
2. Use appropriate accessibility props (e.g., accessibilityLabel, accessibilityHint)
3. Implement proper keyboard navigation

## Testing

1. Write unit tests for components and utilities
2. Implement integration tests for critical user flows
3. Use Jest and React Native Testing Library for testing

## Documentation

1. Add JSDoc comments for functions and components
2. Maintain a README.md file with project setup and running instructions

## Version Control

1. Use Git for version control
2. Follow Git Flow branching strategy
3. Write meaningful commit messages

## Deployment

1. Set up CI/CD pipeline (e.g., using GitHub Actions)
2. Implement environment-specific configurations
3. Use Expo for easier deployment and updates

## Security

1. Implement secure storage for sensitive data
2. Use HTTPS for all API calls
3. Sanitize user inputs to prevent XSS attacks

## Localization

1. Implement i18n for multi-language support if required

## Specific Component Guidelines

### Common Components

#### UserAvatar Component
- Location: `src/Components/common/UserAvatar.tsx`
- Props: `size` (optional, default: 64), `source` (optional)
- Use React Native Paper's Avatar component
- Provide a default icon when no source is provided

#### ModalHeader Component
- Location: `src/Components/common/ModalHeader.tsx`
- Props: `title` (required), `avatarSource` (optional)
- Use React Native's View component for layout
- Include UserAvatar component

### Staff Management Components

#### StaffScreen.tsx (main component)
- Location: `src/Screens/Users/Staff/StaffScreen.tsx`
- Manage overall state and data fetching
- Render child components (Header, RoleCards, StaffList, EditStaffModal, StaffDetailsModal)

#### Header.tsx
- Location: `src/Screens/Users/Staff/components/Header.tsx`
- Display screen title and navigation buttons

#### RoleCards.tsx
- Location: `src/Screens/Users/Staff/components/RoleCards.tsx`
- Display role cards with counts
- Use React Native Paper Card and FlatList components for layout

#### StaffList.tsx
- Location: `src/Screens/Users/Staff/components/StaffList.tsx`
- Display list of staff members
- Implement search functionality
- Use React Native FlatList component

#### EditStaffModal.tsx
- Location: `src/Screens/Users/Staff/components/EditStaffModal.tsx`
- Form for editing staff details
- Use React Native Paper TextInput and Modal components

#### StaffDetailsModal.tsx
- Location: `src/Screens/Users/Staff/components/StaffDetailsModal.tsx`
- Display detailed information about a staff member
- Use React Native Modal component

#### AddStaffScreen.tsx
- Location: `src/Screens/Users/Staff/AddStaffScreen.tsx`
- Form for adding new staff members
- Implement multi-step form using React Native Paper components

Remember to follow the DRY (Don't Repeat Yourself) principle and create reusable components whenever possible. Maintain consistency in naming conventions, file structure, and coding style throughout the project.

## Implementation Guidelines

When implementing new features or components:

1. Always refer to this mobile prompt for guidelines and best practices.
2. Follow the project structure and component organization as outlined above.
3. Adhere to TypeScript best practices:
   - Properly type all variables, function parameters, and return values.
   - Use interfaces or types to define prop types for components.
   - Utilize TypeScript's built-in types and type inference when possible.
4. Avoid linting issues:
   - Remove all unused variables and imports.
   - Declare variables only when needed.
   - Use ESLint and Prettier to catch and fix linting issues early.
5. Ensure code quality:
   - Write clean, readable, and self-documenting code.
   - Use meaningful variable and function names.
   - Keep functions small and focused on a single responsibility.
6. Optimize performance:
   - Memoize expensive computations using useMemo or useCallback.
   - Avoid unnecessary re-renders by using React.memo for pure components.
7. Handle errors gracefully:
   - Implement proper error handling for asynchronous operations.
   - Use try-catch blocks where appropriate.
8. Write unit tests for new components and functions.
9. Update documentation when adding new features or changing existing ones.

Before submitting your code:
- Run the TypeScript compiler to catch any type errors.
- Run ESLint to identify and fix any linting issues.
- Ensure all tests pass.
- Perform a self-review of your code to catch any logical errors or inconsistencies.

## Naming Conventions and Avoiding Conflicts

1. Use unique names for components, interfaces, and types across the project.
2. When naming interfaces or types that share names with components, use a prefix or suffix to differentiate:
   - For interfaces: Use the 'I' prefix (e.g., `IStudentFilters` for the interface, `StudentFilters` for the component)
   - For types: Use the 'Type' suffix (e.g., `StudentFiltersType` for the type, `StudentFilters` for the component)
3. Be cautious when importing types and components with the same name. Use aliases to avoid conflicts:
   ```typescript
   import { StudentFilters as IStudentFilters } from './Interfaces/studentInterfaces';
   import StudentFilters from './components/StudentFilters';
   ```
4. When possible, use more specific names for components to avoid conflicts with interface or type names.

## Common Pitfalls and Best Practices

1. Consistent Naming:
   - Ensure consistency between component names and their file names.
   - Use PascalCase for component names and their corresponding file names.

2. Import Path Consistency:
   - Use relative paths for imports within the same module.
   - Use absolute paths for imports from shared components or utilities.

3. Type Safety:
   - Always provide proper typings for state, props, and function parameters.
   - Avoid using `any` type; instead, create interfaces or types for complex structures.

4. Handling Asynchronous Operations:
   - Always use try-catch blocks for async operations to handle potential errors.
   - Provide user feedback for both success and error cases using React Native Paper's Snackbar component.

5. Component Separation:
   - Extract reusable logic into custom hooks.
   - Create separate components for distinct UI elements to improve readability and maintainability.

6. State Management:
   - Use the `useCallback` hook for functions passed as props to child components to prevent unnecessary re-renders.
   - Consider using `useMemo` for expensive computations that depend on specific state or prop changes.

7. Form Handling:
   - Utilize React Native Paper's TextInput and other form components for consistent form handling across the application.
   - Implement proper form validation using a library like Formik or custom validation rules.

8. Modal Management:
   - Use a consistent pattern for managing modal visibility (e.g., `isVisible` prop for all modal components).
   - Handle modal closing in both the parent component and the modal component itself.

9. Date Handling:
   - Use a consistent date library throughout the project (e.g., moment.js or date-fns).
   - Always format dates before sending them to the server or displaying them to the user.

10. Performance Optimization:
    - Use FlatList for rendering long lists to improve performance.
    - Implement pagination or infinite scrolling for large datasets.
    - Use React.memo for pure functional components to prevent unnecessary re-renders.

11. Code Duplication:
    - Regularly review code for potential duplication and refactor into reusable components or utilities.
    - Follow the DRY (Don't Repeat Yourself) principle rigorously.

12. Consistent Styling:
    - Use React Native StyleSheet for creating styles.
    - Create a theme file for consistent colors, fonts, and spacing across the app.

13. Platform-Specific Code:
    - Use Platform.OS to handle platform-specific styling or behavior when necessary.
    - Create separate files for iOS and Android components if there are significant differences.

14. Navigation:
    - Use React Navigation's type checking for route params to ensure type safety when navigating between screens.
    - Implement proper navigation patterns (e.g., tab navigation for main sections, stack navigation for hierarchical screens).

15. Responsive Design:
    - Use React Native's Dimensions API to create responsive layouts.
    - Consider using a library like react-native-responsive-screen for consistent sizing across different devices.

16. Asset Management:
    - Use the `@2x` and `@3x` naming convention for image assets to support different screen densities.
    - Implement proper image caching strategies to improve performance.

17. Accessibility:
    - Use appropriate accessibility props (e.g., accessibilityLabel, accessibilityHint) for all interactive elements.
    - Test the app with VoiceOver (iOS) and TalkBack (Android) to ensure proper accessibility support.

By adhering to these guidelines and best practices, we can create a high-quality, maintainable, and performant mobile application that aligns with the structure and standards of the School Management System Frontend project.