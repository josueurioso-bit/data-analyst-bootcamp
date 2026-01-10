# Data Analyst Bootcamp - Milestone 0 Assessment

An AI-powered prerequisite assessment platform that evaluates whether aspiring data analysts have the foundational skills needed to start learning data analysis.

🔗 **Live Demo:** [data-analyst-bootcamp.vercel.app](https://data-analyst-bootcamp.vercel.app/)

---

## The Problem

Online students need instant, judgment-free help available 24/7, but human instructors can't scale personalized support to hundreds of students. Career changers without college degrees often don't know if they have the prerequisite skills needed before investing time and money in a bootcamp.

Traditional assessments are rigid pass/fail tests. This creates anxiety and doesn't provide actionable feedback about *what* to work on.

---

## The Solution

**Milestone 0** is a conversational AI assessment that evaluates 6 foundation pillars through natural dialogue, not rigid testing. Students receive instant, honest feedback with concrete next steps.

### Key Features

✅ **24/7 Availability** - No waiting for instructor responses  
✅ **Conversational Format** - Natural dialogue, not intimidating quiz  
✅ **Honest Assessment** - Clear feedback on readiness level (1-5)  
✅ **Actionable Results** - Specific gaps identified with prep recommendations  
✅ **Judgment-Free** - Students can ask "basic" questions without embarrassment  
✅ **Cost-Effective** - ~$0.02-0.05 per complete assessment  
✅ **Scalable** - Handles 1 or 1,000 students simultaneously  

---

## How It Works

### 6 Foundation Pillars

The assessment evaluates foundational skills (NOT data analysis skills):

1. **Basic Numeracy** (10 questions) - Arithmetic, percentages, fractions
2. **Reading Comprehension** (5 questions) - Following instructions, extracting information
3. **Computer Literacy** (10 questions) - File management, shortcuts, troubleshooting
4. **Logical Thinking** (8 questions) - Patterns, if-then logic, problem decomposition
5. **Communication Basics** (5 questions) - Clear writing, simple explanations
6. **Learning Mindset** (7 questions) - Self-direction, resilience, handling mistakes

### Assessment Flow

1. Student opens the assessment (no login required)
2. AI tutor conducts a 20-minute conversational assessment
3. Questions adapt based on responses
4. Student receives comprehensive results dashboard:
   - Overall readiness level (1-5)
   - Breakdown of all 6 pillars (color-coded)
   - Specific strengths highlighted
   - Specific gaps identified
   - Concrete action plan
   - Estimated prep time

### 5 Readiness Levels

- **Level 1: Ready to Start** ✅ - Begin Milestone 1 immediately
- **Level 2: Ready with Quick Prep** ✅⚠️ - 1-2 weeks of targeted prep
- **Level 3: Need Foundation Work** ⚠️ - 4-6 week foundation program
- **Level 4: Need Comprehensive Prep** 🛠️ - 8-12 weeks of preparation
- **Level 5: Not Yet Ready** 📚 - 6-12 months building foundations

---

## Tech Stack

**Frontend:**
- React 18 (via CDN, no build step)
- Tailwind CSS (via CDN)
- Single HTML file deployment

**Backend:**
- Vercel Serverless Functions
- Node.js 20+
- Anthropic Claude Haiku 4.5 (claude-haiku-4-5-20251001)

**Hosting:**
- Vercel (serverless deployment)
- GitHub (version control)

**Cost:**
- Hosting: $0 (Vercel free tier)
- AI API: ~$0.02-0.05 per complete assessment
- Total: Scales linearly with usage

---

## Project Structure

```
/data-analyst-bootcamp
  ├── index.html          # Frontend interface (React via CDN)
  ├── /api
  │   └── chat.js         # Serverless function for Claude API
  ├── .gitignore
  └── README.md
```

---

## Getting Started

### Try It Live

Visit [data-analyst-bootcamp.vercel.app](https://data-analyst-bootcamp.vercel.app/) to experience the assessment.

### Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/josueurioso-bit/data-analyst-bootcamp.git
   cd data-analyst-bootcamp
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```
   
   Get your API key from [console.anthropic.com](https://console.anthropic.com/)

3. **Install Vercel CLI (optional, for local development)**
   ```bash
   npm install -g vercel
   ```

4. **Run locally**
   ```bash
   vercel dev
   ```
   
   Or simply open `index.html` in your browser for frontend-only testing.

---

## Deployment

This project is configured for one-click deployment to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/josueurioso-bit/data-analyst-bootcamp)

**Manual deployment:**

1. Fork this repository
2. Connect to Vercel
3. Add `ANTHROPIC_API_KEY` environment variable
4. Deploy!

---

## Roadmap

### Phase 1: Current MVP ✅
- [x] Conversational assessment interface
- [x] 6 foundation pillars evaluation
- [x] Results dashboard with color-coded feedback
- [x] Deployed to production

### Phase 2: Enhanced Assessment
- [ ] Progress tracking across multiple attempts
- [ ] Detailed analytics dashboard
- [ ] Export results as PDF
- [ ] Email results to student

### Phase 3: Personalization
- [ ] Custom prep plans based on gaps
- [ ] Recommended resources for each pillar
- [ ] Integration with learning platforms (Khan Academy, etc.)
- [ ] Retake scheduling with improvement tracking

### Phase 4: Full Bootcamp Platform
- [ ] Milestone 1: Excel & Data Fundamentals
- [ ] Milestone 2: SQL & Database Basics
- [ ] Milestone 3: Python for Data Analysis
- [ ] Milestone 4: Visualization & Storytelling
- [ ] Job application support system

### Phase 5: Scale & Expand
- [ ] Multi-language support
- [ ] Mobile app (iOS/Android)
- [ ] API for integration with other platforms
- [ ] White-label version for other bootcamps

---

## Architecture

### Frontend → Backend → AI Flow

```
Student Browser
    ↓
index.html (React UI)
    ↓
POST /api/chat
    ↓
Vercel Serverless Function
    ↓
Anthropic Claude API
    ↓
AI Evaluation
    ↓
Response → Student
```

### Security

- ✅ API key stored as environment variable (never exposed to client)
- ✅ HTTPS enforced by Vercel
- ✅ CORS configured appropriately
- ✅ No sensitive data stored (stateless assessment)

Future enhancements:
- [ ] Rate limiting per IP
- [ ] User authentication for progress tracking
- [ ] Input sanitization and validation

---

## Contributing

This is currently a solo project, but contributions are welcome!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution

- UI/UX improvements
- Additional question types
- Multilingual support
- Performance optimizations
- Documentation improvements

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [Anthropic Claude](https://www.anthropic.com/)
- Deployed on [Vercel](https://vercel.com/)
- Inspired by the need to make data analytics education more accessible

---

## Contact

**Project Creator:** Sway  
**GitHub:** [@josueurioso-bit](https://github.com/josueurioso-bit)  
**Live Demo:** [data-analyst-bootcamp.vercel.app](https://data-analyst-bootcamp.vercel.app/)

---

## Project Stats

![GitHub last commit](https://img.shields.io/github/last-commit/josueurioso-bit/data-analyst-bootcamp)
![GitHub issues](https://img.shields.io/github/issues/josueurioso-bit/data-analyst-bootcamp)
![GitHub stars](https://img.shields.io/github/stars/josueurioso-bit/data-analyst-bootcamp)

---

**Note:** This is Milestone 0 of a planned 5-milestone Data Analyst Bootcamp platform. The goal is to provide honest, accessible pathways for career changers without college degrees to break into data analytics careers.
