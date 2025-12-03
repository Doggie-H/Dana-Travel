# Contributing to Dana Travel

First off, thank you for considering contributing to Dana Travel! 🎉

This document provides guidelines for contributing to the project. Following these guidelines helps maintain code quality and makes the collaboration process smoother.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Expected Behavior
- ✅ Be respectful and inclusive
- ✅ Provide constructive feedback
- ✅ Focus on what is best for the community
- ✅ Show empathy towards others

### Unacceptable Behavior
- ❌ Harassment or discriminatory language
- ❌ Personal attacks or insults
- ❌ Publishing others' private information
- ❌ Other unprofessional conduct

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Basic knowledge of React and Node.js
- Familiarity with Prisma ORM (helpful)

### Quick Start
```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/dana-travel.git
cd dana-travel

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/dana-travel.git

# 4. Install dependencies
cd Backend && npm install
cd ../Frontend && npm install

# 5. Set up environment
cp Backend/.env.example Backend/.env
# Edit .env with your API keys

# 6. Initialize database
cd Backend
npx prisma migrate dev
npx prisma db seed

# 7. Run development servers
cd Backend && npm run dev  # Terminal 1
cd Frontend && npm run dev # Terminal 2
```

---

## Development Setup

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_key_here"
JWT_SECRET="random_secret_key"
PORT=3000
NODE_ENV=development
```

**Get Gemini API Key:**
1. Go to https://ai.google.dev/
2. Sign in with Google account
3. Create a new API key
4. Add to `.env`

### Database

```bash
# Create a new migration
npx prisma migrate dev --name add_new_field

# Reset database (caution!)
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio
```

### Running Tests

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test

# Run with coverage
npm run test:coverage
```

---

## How to Contribute

### Types of Contributions

1. **Bug Fixes**
   - Fix a reported issue
   - Add test cases
   - Update documentation if needed

2. **New Features**
   - Discuss in Issues first
   - Follow architecture patterns
   - Include tests and docs

3. **Documentation**
   - Fix typos
   - Improve clarity
   - Add examples
   - Translate to other languages

4. **Code Quality**
   - Refactoring
   - Performance improvements
   - Adding tests

### Workflow

```
1. Pick an issue (or create one)
   ↓
2. Fork & create branch
   ↓
3. Make changes locally
   ↓
4. Write/update tests
   ↓
5. Run linter & tests
   ↓
6. Commit with clear message
   ↓
7. Push to your fork
   ↓
8. Open Pull Request
   ↓
9. Address review feedback
   ↓
10. Merge! 🎉
```

---

## Coding Standards

### JavaScript/React Style Guide

**General Principles:**
- Use functional components with Hooks (not class components)
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Use ESLint and Prettier

**Naming Conventions:**
```javascript
// Components: PascalCase
function TripPlanningForm() { }

// Functions: camelCase
function calculateBudget() { }

// Constants: UPPER_SNAKE_CASE
const MAX_BUDGET = 100000000;

// Private functions: _camelCase
function _validateInput() { }

// Files: match component/function name
TripPlanningForm.jsx
calculateBudget.js
```

**Code Organization:**
```javascript
// 1. Imports (grouped)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SomeComponent from './SomeComponent';
import { helperFunction } from '../utils';

// 2. Constants
const DEFAULT_CONFIG = { };

// 3. Component definition
export default function MyComponent() {
  // 3a. Hooks
  const [state, setState] = useState();
  const navigate = useNavigate();
  
  // 3b. Event handlers
  const handleClick = () => { };
  
  // 3c. Effects
  useEffect(() => { }, []);
  
  // 3d. Render
  return <div>...</div>;
}
```

### Backend Patterns

**Service Layer:**
```javascript
// services/example.service.js

/**
 * Brief description in Vietnamese
 * @param {Object} params - Description
 * @returns {Promise<Object>}
 */
export const doSomething = async (params) => {
  // 1. Validate input
  if (!params) throw new Error('Invalid input');
  
  // 2. Business logic
  const result = await processData(params);
  
  // 3. Return result
  return result;
};
```

**Controller Pattern:**
```javascript
// controllers/example.controller.js
export const handleRequest = async (req, res) => {
  try {
    // 1. Extract & validate
    const { param } = req.body;
    
    // 2. Call service
    const result = await exampleService.doSomething(param);
    
    // 3. Return response
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Comments

**Use Vietnamese for business logic comments:**
```javascript
// ✅ Good
// Tính toán tổng chi phí dựa trên số người và số ngày
const totalCost = numPeople * numDays * costPerDay;

// ❌ Bad
// Calculate total cost
const totalCost = numPeople * numDays * costPerDay;
```

**Use English for technical comments:**
```javascript
// ✅ Good
// TODO: Refactor this to use async/await
// FIXME: Memory leak when unmounting

// ❌ Bad
// TODO: Sửa lại cái này
```

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Build/config changes

**Examples:**
```bash
feat(itinerary): add hotel filtering by price range

Implement price range filter in itinerary generation algorithm.
Users can now specify min/max price for accommodations.

Closes #123

---

fix(chatbot): resolve intent detection bug

Fixed issue where "trời mưa" wasn't triggering weather intent.
Added more regex patterns for Vietnamese phrases.

Fixes #456

---

docs(README): update installation instructions

Added missing step for Gemini API key setup.
Clarified Node.js version requirement.
```

### Commit Best Practices

✅ **DO:**
- Keep commits atomic (one logical change)
- Write clear, descriptive messages
- Reference issue numbers
- Commit frequently

❌ **DON'T:**
- Mix multiple unrelated changes
- Write vague messages like "fix stuff"
- Commit commented-out code
- Commit `.env` files or secrets

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] Added tests for new code
- [ ] Updated documentation
- [ ] Ran `npm run lint` without errors
- [ ] Checked for console errors
- [ ] Tested in both Chrome and Firefox

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## Testing
Describe how you tested this

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code (Vietnamese for business logic)
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests
- [ ] All tests pass
```

### Review Process

1. **Automated Checks**
   - CI/CD runs tests
   - Linter checks code style
   - Build verification

2. **Code Review**
   - At least 1 approval required
   - Reviewers check logic, style, tests
   - Address all feedback

3. **Merge**
   - Squash commits (if many small commits)
   - Merge to `main` branch
   - Delete feature branch

---

## Reporting Bugs

### Before Reporting

1. **Check existing issues** - Maybe someone already reported it
2. **Try latest version** - Bug might be fixed
3. **Reproduce** - Can you make it happen again?

### Bug Report Template

```markdown
**Bug Description**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- OS: Windows 11
- Browser: Chrome 120
- Node.js: 18.17.0

**Additional Context**
Any other info
```

---

## Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
Clear description of feature

**Problem It Solves**
What pain point does this address?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other ways to solve this

**Additional Context**
Mockups, examples, etc.
```

### Discussion Process

1. Open an issue with `[Feature Request]` tag
2. Community discusses feasibility
3. Maintainers approve/reject
4. If approved, someone can implement

---

## Development Tips

### Debugging Backend

```javascript
// Use DEBUG environment variable
DEBUG=express:* npm run dev

// Add debug logs
console.log('[DEBUG]', variable);
```

### Debugging React

```javascript
// React DevTools (Chrome extension)
// Use debugger statement
debugger;

// Log in useEffect
useEffect(() => {
  console.log('State changed:', state);
}, [state]);
```

### Testing Tips

```javascript
// Test naming convention
describe('calculateBudget', () => {
  it('should return correct budget breakdown', () => {
    const result = calculateBudget(input);
    expect(result.total).toBe(expected);
  });
  
  it('should throw error for invalid input', () => {
    expect(() => calculateBudget(null)).toThrow();
  });
});
```

---

## Resources

- **React Docs**: https://react.dev/
- **Express.js Guide**: https://expressjs.com/
- **Prisma Docs**: https://www.prisma.io/docs
- **Gemini API**: https://ai.google.dev/docs

---

## Recognition

Contributors will be added to:
- `CONTRIBUTORS.md` file
- Project README
- GitHub contributors page

Thank you for making Dana Travel better! 🌴✨

---

**Questions?**  
Open an issue or email: dev@danatravel.vn
