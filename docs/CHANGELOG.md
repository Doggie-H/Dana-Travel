# Changelog

All notable changes to Dana Travel will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Multi-language support (English, Korean, Japanese)
- Offline mode with PWA
- Mobile app (React Native)
- Integration with booking platforms
- Weather API integration
- Voice assistant

---

## [1.0.0] - 2025-12-03

### Added
- 🎉 Initial release of Dana Travel
- ✨ Automatic itinerary generation with TSP optimization
- 🤖 AI Chatbot with RAG (Retrieval-Augmented Generation)
- 📊 Admin Dashboard with analytics
- 🗺️ Interactive map with OpenStreetMap
- 💰 Smart budget allocation system
- 🔐 JWT-based authentication
- 📱 Responsive design for mobile/tablet/desktop
- 🎯 Multi-step wizard form for trip planning
- 📈 Traffic analytics and search trend tracking
- 🏨 Location management system (CRUD)
- 💬 Real-time chat interface
- 🔍 Knowledge base for FAQ
- 📜 Access log tracking
- 🎨 Modern UI with Tailwind CSS and Framer Motion

### Technical Stack
- **Frontend**: React 18, Vite, React Router, Tailwind CSS
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: SQLite (dev), PostgreSQL (production-ready)
- **AI**: Google Gemini API
- **Maps**: React-Leaflet + OpenStreetMap
- **Charts**: Chart.js

### Architecture
- Modular monolithic design
- Service-oriented architecture
- RESTful API
- JWT authentication with HttpOnly cookies
- Role-based access control (RBAC)

### Security
- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Rate limiting
- Input validation with Zod
- SQL injection prevention via Prisma ORM
- XSS protection
- HTTP security headers with Helmet

---

## [0.5.0] - 2025-11-28 (Beta)

### Added
- Beta release for testing
- Core itinerary generation algorithm
- Basic chatbot functionality
- Simple admin panel
- Basic location database

### Changed
- Migrated from JSON files to Prisma + SQLite
- Improved algorithm performance
- Enhanced UI/UX design

### Fixed
- Multiple timezone handling issues
- Budget calculation edge cases
- Map marker clustering problems

---

## [0.2.0] - 2025-11-15 (Alpha)

### Added
- Proof of concept
- Basic trip form
- Simple trip planner logic
- Static location data

### Known Issues
- No authentication
- Limited locations
- Basic UI only

---

## Version History Summary

| Version | Date | Status | Key Features |
|---------|------|--------|--------------|
| 1.0.0 | 2025-12-03 | Stable | Full release with AI chatbot |
| 0.5.0 | 2025-11-28 | Beta | Core features complete |
| 0.2.0 | 2025-11-15 | Alpha | Proof of concept |

---

## Upgrade Guide

### From 0.5.0 to 1.0.0

#### Database Migration
```bash
cd Backend
npx prisma migrate deploy
```

#### Environment Variables
Add new variables to `.env`:
```env
GEMINI_API_KEY=your_api_key
JWT_SECRET=your_secret
```

#### Breaking Changes
- `chatbot` folder renamed to `bot` in frontend
- Admin API endpoints moved from `/admin/*` to `/api/admin/*`
- Authentication now requires JWT tokens

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute.

## Support

- 📧 Email: support@danatravel.vn
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/dana-travel/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/dana-travel/discussions)

---

**Legend:**
- 🎉 Major milestone
- ✨ New feature
- 🐛 Bug fix
- 🔒 Security fix
- ⚡ Performance improvement
- 📝 Documentation
- 🎨 UI/UX improvement
- ♻️ Refactoring
- 🗑️ Deprecation
- 💥 Breaking change
