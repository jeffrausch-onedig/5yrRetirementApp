# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 5-Year Retirement Plan Evaluation App designed for retirement plan consultants. The application focuses on:

- Evaluating current client plan engagement and contribution patterns
- Modeling plan design modifications and their impact on long-term outcomes
- Visualizing total plan assets, average employee account balances, and career-long retirement outcomes

## Target Users

- Retirement plan consultants
- Financial advisors specializing in employer-sponsored retirement plans  
- HR professionals managing company retirement benefits

## Current State

This repository contains a complete retirement plan evaluation application with participant engagement tools:

- `index.html` - Main setup form with all required input fields including engagement parameters
- `results.html` - Results page with line chart visualization and data table
- `engagement.html` - Participant engagement analysis dashboard with behavioral insights
- `demo.html` - Interactive demo tool for quick client presentations
- `styles.css` - Responsive CSS styling with professional design
- `script.js` - Form validation, interactions, and data handling
- `results.js` - Asset growth calculations and Chart.js visualization
- `engagement.js` - Behavioral analytics and engagement modeling
- `test.html` - Simple test page for debugging data flow
- `README.md` - Project overview and requirements framework

## Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, CSS Custom Properties, Responsive design
- **Charting**: Chart.js (CDN) for line and bar chart visualization
- **Data Persistence**: localStorage for client-side data storage
- **Local Development**: Python HTTP server or any static file server

## Key Features

### Setup Input Form
- 15+ input fields for retirement plan parameters
- Real-time form validation with error messaging
- Auto escalation conditional logic
- Currency and percentage formatting
- Data persistence via localStorage
- **New:** Engagement parameters (enrollment method, vesting, investment options, demographics)

### Results Visualization
- 25-year projection line chart (5-year increments)
- Monthly compounding calculations
- Fee impact analysis (investment fees always paid by employees)
- Summary cards showing key metrics
- Detailed projection data table
- Export functionality for setup data
- **New:** Auto-enrollment scenario modeling

### Engagement Analysis Dashboard
- **Behavioral Insights:** Participation patterns by age, contribution lifecycle modeling
- **Scenario Comparison:** Current vs. auto-enrollment vs. enhanced engagement
- **Readiness Scoring:** Weighted composite metrics (participation 40%, contribution 35%, match 25%)
- **Strategic Recommendations:** Automated advice based on plan characteristics
- **Interactive Charts:** Participation impact, readiness distribution, age patterns, engagement journey

### Interactive Demo Tool
- **Quick Setup:** Preset configurations for small/medium/large plans
- **Real-time Modeling:** Instant scenario comparison with visual feedback
- **Client Presentation:** Mobile-responsive design for consultant meetings
- **Export Capability:** Demo data export for client follow-up

## Development Commands

### Running the Application
```bash
# Start local development server (Python 3)
python3 -m http.server 8000

# Alternative with Python 2
python -m SimpleHTTPServer 8000

# Then open http://localhost:8000 in your browser
```

### Testing & Debugging
```bash
# Use test.html for quick debugging and data flow testing
# Open http://localhost:8000/test.html after starting server
# Test page provides buttons to populate localStorage with sample data
```

- Manual testing through browser interface
- Form validation testing with various input scenarios  
- Responsive design testing across different screen sizes
- Use `test.html` for debugging data persistence and calculations

## Key Functional Areas (Planned)

### Current State Analysis
- Plan participation rate assessment
- Contribution pattern analysis
- Plan engagement metrics evaluation

### Plan Design Impact Modeling  
- Scenario modeling for design changes
- Long-term asset growth projections
- Career-span employee balance analysis

### Reporting & Visualization
- Interactive charts and graphs
- Comparative analysis between current/proposed designs
- Career timeline visualizations

## Architecture & Code Structure

### Data Flow
1. **Input Collection**: `index.html` + `script.js` collect user inputs with real-time validation
2. **Data Persistence**: Form data stored in localStorage as JSON
3. **Calculations**: `results.js` performs complex financial projections with monthly compounding
4. **Visualization**: Chart.js renders interactive line and bar charts
5. **Export**: Results can be exported as JSON data

### Key Components

#### Form Validation (`script.js`)
- Real-time field validation with error messaging
- Conditional logic for auto-escalation fields
- Business rule validation (participants ≤ eligible employees)
- Currency and percentage formatting
- Form reset functionality

#### Financial Calculations (`results.js`)
- **Projection Scenarios**: Current plan, optimized (max match), 10% contribution
- **Monthly Compounding**: Investment returns calculated monthly over 25 years
- **Auto Escalation**: Annual contribution rate increases when enabled
- **Fee Management**: Flexible fee allocation (employer/employee/split)
- **Chart Data**: 5-year intervals for visualization, annual data for detailed table

#### Styling Architecture (`styles.css`)
- CSS Grid for responsive form layouts
- CSS Custom Properties for consistent theming
- Professional gradient backgrounds and card-based design
- Mobile-first responsive design patterns

### Important Calculations
- Investment fees are always paid by employees regardless of other fee settings
- Employer match utilization varies by scenario (current/optimized/10%/auto-enrollment)
- Monthly compounding with annual fee deductions
- Auto escalation caps at specified maximum rate

### Engagement Modeling Methodology
- **Auto-enrollment Impact:** Research-based 2.8x participation multiplier, 1.8x match utilization boost
- **Behavioral Factors:** Age-based contribution patterns, tenure impact on engagement
- **Readiness Scoring:** Composite metric weighted by participation (40%), contribution adequacy (35%), match utilization (25%)
- **Scenario Assumptions:** Auto-enrollment defaults to 3% contribution, enhanced engagement adds behavioral nudges

### Navigation Flow
1. **Setup Form** (`index.html`) → Collect plan parameters and engagement factors
2. **Engagement Analysis** (`engagement.html`) → Behavioral insights and strategic recommendations
3. **Results Projections** (`results.html`) → Financial modeling and growth charts
4. **Interactive Demo** (`demo.html`) → Quick client presentation tool