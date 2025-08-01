document.addEventListener('DOMContentLoaded', function() {
    console.log('Engagement analysis page loaded');
    
    // Get data from localStorage
    const setupDataString = localStorage.getItem('planSetupData');
    const setupData = JSON.parse(setupDataString || '{}');
    
    if (Object.keys(setupData).length === 0) {
        alert('No setup data found. Please complete the setup form first.');
        window.location.href = 'index.html';
        return;
    }

    // Parse setup data
    const eligibleEmployees = parseInt(setupData.eligibleEmployees) || 0;
    const participants = parseInt(setupData.participants) || 0;
    const avgSalary = parseFloat(setupData.avgSalary) || 0;
    const employeeContribRate = parseFloat(setupData.employeeContribRate) || 0;
    const employer401kMatch = parseFloat(setupData.employer401kMatch) || 0;
    const participantsMaxMatch = parseFloat(setupData.participantsMaxMatch) || 0;
    const enrollmentMethod = setupData.enrollmentMethod || 'opt-in';
    const defaultAutoContribRate = parseFloat(setupData.defaultAutoContribRate) || 3;
    const vestingSchedule = setupData.vestingSchedule || 'immediate';
    const investmentOptions = parseInt(setupData.investmentOptions) || 12;
    const avgTenure = parseFloat(setupData.avgTenure) || 5;
    const avgAge = parseInt(setupData.avgAge) || 42;

    // Calculate engagement metrics
    const engagementData = calculateEngagementMetrics();
    
    // Update UI
    updateEngagementMetrics(engagementData);
    createEngagementCharts(engagementData);
    generateRecommendations(engagementData);
    
    // Set up scenario tabs
    setupScenarioTabs();

    function calculateEngagementMetrics() {
        const currentParticipationRate = eligibleEmployees > 0 ? (participants / eligibleEmployees) * 100 : 0;
        
        // Research-based engagement modeling
        const engagementFactors = {
            enrollmentMethod: enrollmentMethod === 'auto-enroll' ? 1.5 : 1.0, // Auto-enrollment can triple participation
            vestingSchedule: vestingSchedule === 'immediate' ? 1.2 : (vestingSchedule === '3-year' ? 1.1 : 1.0),
            investmentOptions: investmentOptions >= 10 && investmentOptions <= 15 ? 1.1 : (investmentOptions > 20 ? 0.9 : 1.0),
            avgAge: avgAge < 30 ? 0.8 : (avgAge > 50 ? 1.3 : 1.0),
            avgTenure: avgTenure > 3 ? 1.2 : 0.9
        };

        // Calculate projected engagement improvements
        const autoEnrollProjection = Math.min(95, currentParticipationRate * 2.8); // Auto-enrollment typically triples participation
        const enhancedProjection = Math.min(98, autoEnrollProjection * 1.15); // Additional behavioral enhancements
        
        // Contribution rate projections
        const currentAvgContrib = employeeContribRate;
        const autoEnrollAvgContrib = enrollmentMethod === 'auto-enroll' ? 
            Math.max(currentAvgContrib, defaultAutoContribRate) : defaultAutoContribRate;
        const enhancedAvgContrib = autoEnrollAvgContrib * 1.25; // Auto-escalation and education boost
        
        // Match utilization calculations
        const currentMatchUtil = participantsMaxMatch;
        const autoEnrollMatchUtil = Math.min(100, currentMatchUtil * 1.4);
        const enhancedMatchUtil = Math.min(100, autoEnrollMatchUtil * 1.1);
        
        // Retirement readiness scoring (0-100)
        const baseReadiness = calculateRetirementReadiness(currentParticipationRate, currentAvgContrib, currentMatchUtil);
        const autoEnrollReadiness = calculateRetirementReadiness(autoEnrollProjection, autoEnrollAvgContrib, autoEnrollMatchUtil);
        const enhancedReadiness = calculateRetirementReadiness(enhancedProjection, enhancedAvgContrib, enhancedMatchUtil);

        return {
            current: {
                participation: currentParticipationRate,
                avgContribution: currentAvgContrib,
                matchUtilization: currentMatchUtil,
                readiness: baseReadiness
            },
            autoEnroll: {
                participation: autoEnrollProjection,
                avgContribution: autoEnrollAvgContrib,
                matchUtilization: autoEnrollMatchUtil,
                readiness: autoEnrollReadiness
            },
            enhanced: {
                participation: enhancedProjection,
                avgContribution: enhancedAvgContrib,
                matchUtilization: enhancedMatchUtil,
                readiness: enhancedReadiness
            },
            demographics: calculateDemographicInsights(),
            behavioralPattern: calculateBehavioralPatterns()
        };
    }

    function calculateRetirementReadiness(participation, contribution, matchUtil) {
        // Weighted scoring based on research insights
        const participationWeight = 0.4;
        const contributionWeight = 0.35;
        const matchWeight = 0.25;
        
        const participationScore = Math.min(100, participation);
        const contributionScore = Math.min(100, (contribution / 10) * 100); // 10% contribution = 100 score
        const matchScore = matchUtil;
        
        return Math.round(
            (participationScore * participationWeight) +
            (contributionScore * contributionWeight) +
            (matchScore * matchWeight)
        );
    }

    function calculateDemographicInsights() {
        // Generate age-based contribution patterns based on research
        const ageGroups = [
            { age: '20-29', participation: avgAge < 30 ? 45 : 35, contribution: 4.2 },
            { age: '30-39', participation: avgAge >= 30 && avgAge < 40 ? 72 : 65, contribution: 6.1 },
            { age: '40-49', participation: avgAge >= 40 && avgAge < 50 ? 85 : 78, contribution: 8.3 },
            { age: '50-59', participation: avgAge >= 50 && avgAge < 60 ? 92 : 85, contribution: 11.2 },
            { age: '60+', participation: avgAge >= 60 ? 95 : 88, contribution: 13.8 }
        ];
        
        return ageGroups;
    }

    function calculateBehavioralPatterns() {
        // Model typical participant journey based on tenure and engagement factors
        const journeyStages = [
            { stage: 'Enrollment', current: participants / eligibleEmployees * 100, potential: 95 },
            { stage: 'Initial Contribution', current: employeeContribRate, potential: 6 },
            { stage: 'Match Awareness', current: participantsMaxMatch, potential: 90 },
            { stage: 'Optimization', current: participantsMaxMatch * 0.8, potential: 85 },
            { stage: 'Long-term Planning', current: 45, potential: 75 }
        ];
        
        return journeyStages;
    }

    function updateEngagementMetrics(data) {
        document.getElementById('participationRate').textContent = `${data.current.participation.toFixed(1)}%`;
        document.getElementById('avgContribRate').textContent = `${data.current.avgContribution.toFixed(1)}%`;
        document.getElementById('matchUtilization').textContent = `${data.current.matchUtilization.toFixed(1)}%`;
        document.getElementById('readinessScore').textContent = data.current.readiness;
        
        // Calculate and display improvement potential
        const participationGain = data.autoEnroll.participation - data.current.participation;
        const contribGain = data.autoEnroll.avgContribution - data.current.avgContribution;
        const matchGain = data.autoEnroll.matchUtilization - data.current.matchUtilization;
        const readinessGain = data.autoEnroll.readiness - data.current.readiness;
        
        updateChangeIndicator('participationChange', participationGain, '%');
        updateChangeIndicator('contribChange', contribGain, '%');
        updateChangeIndicator('matchChange', matchGain, '%');
        updateChangeIndicator('readinessChange', readinessGain, ' pts');
    }

    function updateChangeIndicator(elementId, change, suffix) {
        const element = document.getElementById(elementId);
        if (change > 0) {
            element.textContent = `+${change.toFixed(1)}${suffix} potential`;
            element.className = 'metric-change positive';
        } else if (change < 0) {
            element.textContent = `${change.toFixed(1)}${suffix}`;
            element.className = 'metric-change negative';
        } else {
            element.textContent = 'No change';
            element.className = 'metric-change';
        }
    }

    function createEngagementCharts(data) {
        createParticipationChart(data);
        createReadinessChart(data);
        createAgePatternChart(data);
        createJourneyChart(data);
    }

    function createParticipationChart(data) {
        const ctx = document.getElementById('participationChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Current Plan', 'Auto-Enrollment', 'Enhanced Engagement'],
                datasets: [
                    {
                        label: 'Participation Rate',
                        data: [
                            data.current.participation,
                            data.autoEnroll.participation,
                            data.enhanced.participation
                        ],
                        backgroundColor: ['#667eea', '#27ae60', '#f39c12'],
                        borderWidth: 0,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Participation Rate Comparison'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Participation Rate (%)'
                        }
                    }
                }
            }
        });
    }

    function createReadinessChart(data) {
        const ctx = document.getElementById('readinessChart').getContext('2d');
        
        // Create readiness distribution data
        const readinessDistribution = [
            { range: 'Low (0-40)', current: 35, enhanced: 15 },
            { range: 'Medium (41-70)', current: 45, enhanced: 35 },
            { range: 'High (71-100)', current: 20, enhanced: 50 }
        ];
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: readinessDistribution.map(d => d.range),
                datasets: [{
                    data: readinessDistribution.map(d => d.current),
                    backgroundColor: ['#e74c3c', '#f39c12', '#27ae60'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Current Readiness Distribution'
                    }
                }
            }
        });
    }

    function createAgePatternChart(data) {
        const ctx = document.getElementById('agePatternChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.demographics.map(d => d.age),
                datasets: [
                    {
                        label: 'Participation Rate',
                        data: data.demographics.map(d => d.participation),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Avg Contribution Rate',
                        data: data.demographics.map(d => d.contribution),
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Age Group'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Participation Rate (%)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Contribution Rate (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    function createJourneyChart(data) {
        const ctx = document.getElementById('journeyChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.behavioralPattern.map(p => p.stage),
                datasets: [
                    {
                        label: 'Current Performance',
                        data: data.behavioralPattern.map(p => p.current),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        pointBackgroundColor: '#667eea'
                    },
                    {
                        label: 'Potential with Enhancements',
                        data: data.behavioralPattern.map(p => p.potential),
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.2)',
                        pointBackgroundColor: '#27ae60'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                }
            }
        });
    }

    function generateRecommendations(data) {
        const recommendations = [];
        
        // Auto-enrollment recommendation
        if (enrollmentMethod === 'opt-in') {
            const participationIncrease = data.autoEnroll.participation - data.current.participation;
            recommendations.push({
                priority: 1,
                title: 'Implement Auto-Enrollment',
                description: `Auto-enrollment could increase participation by ${participationIncrease.toFixed(1)} percentage points, potentially adding ${Math.round((participationIncrease/100) * eligibleEmployees)} new participants.`,
                impact: 'High'
            });
        }
        
        // Match optimization
        if (participantsMaxMatch < 80) {
            recommendations.push({
                priority: 2,
                title: 'Enhance Match Communication',
                description: `Only ${participantsMaxMatch.toFixed(1)}% of participants maximize their match. Targeted education could recover an estimated $${Math.round(((100 - participantsMaxMatch)/100) * participants * avgSalary * (employer401kMatch/100)).toLocaleString()} in unused match dollars.`,
                impact: 'High'
            });
        }
        
        // Investment menu optimization
        if (investmentOptions > 20) {
            recommendations.push({
                priority: 3,
                title: 'Streamline Investment Menu',
                description: `Your plan offers ${investmentOptions} investment options. Research shows 10-12 options optimize engagement while reducing choice paralysis.`,
                impact: 'Medium'
            });
        }
        
        // Auto-escalation
        if (setupData.autoEscalation !== 'yes') {
            recommendations.push({
                priority: 4,
                title: 'Add Auto-Escalation Feature',
                description: 'Auto-escalation can increase average contribution rates by 2-3 percentage points over time, significantly improving retirement outcomes.',
                impact: 'Medium'
            });
        }
        
        // Age-based recommendations
        if (avgAge < 35) {
            recommendations.push({
                priority: 5,
                title: 'Target Younger Employee Engagement',
                description: 'Your workforce skews younger. Consider mobile-first communication, student loan assistance programs, and emphasizing long-term compound growth.',
                impact: 'Medium'
            });
        }
        
        // Tenure-based recommendations
        if (avgTenure < 3) {
            recommendations.push({
                priority: 6,
                title: 'Address High Turnover Impact',
                description: 'Short average tenure may limit engagement. Consider immediate vesting and early engagement strategies for new hires.',
                impact: 'Medium'
            });
        }
        
        const container = document.getElementById('recommendationsList');
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-icon">${rec.priority}</div>
                <div class="recommendation-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                </div>
            </div>
        `).join('');
    }

    function setupScenarioTabs() {
        const tabs = document.querySelectorAll('.scenario-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const scenario = this.dataset.scenario;
                updateScenarioView(scenario);
            });
        });
    }

    function updateScenarioView(scenario) {
        // This would update charts and metrics based on selected scenario
        console.log('Updating view for scenario:', scenario);
        // Implementation would re-render charts with scenario-specific data
    }
});

function goBack() {
    window.location.href = 'index.html';
}

function goToResults() {
    window.location.href = 'results.html';
}

function exportEngagementReport() {
    const setupData = JSON.parse(localStorage.getItem('planSetupData') || '{}');
    
    // Create engagement report data
    const reportData = {
        planData: setupData,
        generatedDate: new Date().toISOString(),
        reportType: 'Participant Engagement Analysis',
        metrics: {
            currentParticipation: document.getElementById('participationRate').textContent,
            averageContribution: document.getElementById('avgContribRate').textContent,
            matchUtilization: document.getElementById('matchUtilization').textContent,
            readinessScore: document.getElementById('readinessScore').textContent
        }
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `engagement-analysis-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}