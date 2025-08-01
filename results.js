document.addEventListener('DOMContentLoaded', function() {
    console.log('Results page loaded');
    
    // Get data from localStorage
    const setupDataString = localStorage.getItem('planSetupData');
    console.log('Raw setup data:', setupDataString);
    
    const setupData = JSON.parse(setupDataString || '{}');
    console.log('Parsed setup data:', setupData);
    
    if (Object.keys(setupData).length === 0) {
        console.log('No setup data found');
        alert('No setup data found. Please complete the setup form first.');
        window.location.href = 'index.html';
        return;
    }

    // Parse setup data
    const participants = parseInt(setupData.participants) || 0;
    const avgAccountBalance = parseFloat(setupData.avgAccountBalance) || 0;
    const avgSalary = parseFloat(setupData.avgSalary) || 0;
    const investmentReturn = parseFloat(setupData.investmentReturn) || 0;
    const employeeContribRate = parseFloat(setupData.employeeContribRate) || 0;
    const employerContribRate = parseFloat(setupData.employerContribRate) || 0;
    const employer401kMatch = parseFloat(setupData.employer401kMatch) || 0;
    const participantsMaxMatch = parseFloat(setupData.participantsMaxMatch) || 0;
    const autoEscalation = setupData.autoEscalation === 'yes';
    const maxAutoEscalationRate = parseFloat(setupData.maxAutoEscalationRate) || 0;
    
    // New engagement parameters
    const enrollmentMethod = setupData.enrollmentMethod || 'opt-in';
    const defaultAutoContribRate = parseFloat(setupData.defaultAutoContribRate) || 3;
    const vestingSchedule = setupData.vestingSchedule || 'immediate';
    const investmentOptions = parseInt(setupData.investmentOptions) || 12;
    const avgTenure = parseFloat(setupData.avgTenure) || 5;
    const avgAge = parseInt(setupData.avgAge) || 42;
    
    // Fees
    const recordKeeperFee = parseFloat(setupData.recordKeeperFee) || 0;
    const advisorFee = parseFloat(setupData.advisorFee) || 0;
    const tpaFee = parseFloat(setupData.tpaFee) || 0;
    const investmentFee = parseFloat(setupData.investmentFee) || 0;
    const auditFee = parseFloat(setupData.auditFee) || 0;
    const feesPaidBy = setupData.feesPaidBy || 'employer';

    try {
        // Calculate projections for all four scenarios
        console.log('Starting calculations...');
        const currentProjections = calculateProjections('current');
        const optimizedProjections = calculateProjections('optimized');
        const tenPercentProjections = calculateProjections('tenPercent');
        const autoEnrollProjections = calculateProjections('autoEnroll');
        console.log('Projections calculated:', { 
            current: currentProjections, 
            optimized: optimizedProjections,
            tenPercent: tenPercentProjections,
            autoEnroll: autoEnrollProjections
        });
        
        // Debug: Check contribution rates for each scenario
        console.log('Contribution comparison:');
        console.log('Current - Employee:', employeeContribRate + '%, Match utilization:', participantsMaxMatch + '%');
        console.log('Optimized - Employee:', employer401kMatch + '%, Match utilization: 100%');
        console.log('10% - Employee: 10%, Match utilization:', Math.min(100, participantsMaxMatch + 30) + '%');
        
        // Update summary cards
        console.log('Updating summary cards...');
        updateSummaryCards(currentProjections, optimizedProjections, tenPercentProjections);
        
        // Create charts
        console.log('Creating charts...');
        createChart(currentProjections, optimizedProjections, tenPercentProjections);
        createDeltaChart(currentProjections, optimizedProjections, tenPercentProjections);
        
        // Populate data table
        console.log('Populating data table...');
        populateDataTable(currentProjections, optimizedProjections, tenPercentProjections);
        
        console.log('Results page fully loaded');
    } catch (error) {
        console.error('Error loading results page:', error);
        alert('Error loading results: ' + error.message);
    }

    function calculateProjections(scenario = 'current') {
        const years = 25;
        const monthsPerYear = 12;
        const projections = [];
        
        // Determine contribution rates based on scenario
        let effectiveEmployeeRate = employeeContribRate;
        let effectiveMatchUtilization = participantsMaxMatch;
        
        if (scenario === 'optimized') {
            // In optimized scenario, employee contribution rate equals match rate
            effectiveEmployeeRate = employer401kMatch;
            // Assume 100% of participants maximize match in optimized scenario
            effectiveMatchUtilization = 100;
        } else if (scenario === 'tenPercent') {
            // In 10% scenario, employee contributes 10% (common retirement advice)
            effectiveEmployeeRate = 10;
            // With 10% contribution, assume near-maximum match utilization
            effectiveMatchUtilization = Math.min(100, participantsMaxMatch + 30); // Cap at 100%
        } else if (scenario === 'autoEnroll') {
            // Auto-enrollment scenario with behavioral modeling
            if (enrollmentMethod === 'auto-enroll') {
                // If already auto-enrolled, use enhanced version
                effectiveEmployeeRate = Math.max(employeeContribRate, defaultAutoContribRate * 1.2);
                effectiveMatchUtilization = Math.min(100, participantsMaxMatch + 25);
            } else {
                // Model switch to auto-enrollment with default rate
                effectiveEmployeeRate = defaultAutoContribRate;
                effectiveMatchUtilization = Math.min(100, participantsMaxMatch * 1.8); // Auto-enrollment dramatically improves match utilization
            }
        }
        
        // Calculate monthly rates
        const monthlyReturn = investmentReturn / 100 / monthsPerYear;
        const monthlyEmployeeContrib = (effectiveEmployeeRate / 100) * avgSalary / monthsPerYear;
        const monthlyEmployerContrib = (employerContribRate / 100) * avgSalary / monthsPerYear;
        
        // Calculate match contribution - employer401kMatch is the MAXIMUM match as % of salary
        // The actual match depends on how much the employee contributes and match utilization
        const maxMatchPerMonth = (employer401kMatch / 100) * avgSalary / monthsPerYear;
        const monthlyMatchContrib = maxMatchPerMonth * (effectiveMatchUtilization / 100);
        
        // Calculate annual fees paid by employees
        let annualFeesPerEmployee = investmentFee; // Always paid by employee
        if (feesPaidBy === 'employee') {
            annualFeesPerEmployee += recordKeeperFee + advisorFee + tpaFee + auditFee;
        } else if (feesPaidBy === 'split') {
            annualFeesPerEmployee += (recordKeeperFee + advisorFee + tpaFee + auditFee) / 2;
        }
        
        // Divide annual fees by participants to get per-person impact
        const annualFeePerPerson = participants > 0 ? annualFeesPerEmployee / participants : 0;
        
        let currentBalance = avgAccountBalance;
        let currentEmployeeRate = effectiveEmployeeRate;
        
        // Track annual data for chart (every 5 years)
        const chartData = [];
        
        for (let year = 0; year <= years; year++) {
            let yearStartBalance = currentBalance;
            let totalAnnualContributions = 0;
            let totalInvestmentGrowth = 0;
            let totalAnnualFees = 0;
            
            // Apply auto escalation annually (if enabled and not at max)
            if (autoEscalation && year > 0 && currentEmployeeRate < maxAutoEscalationRate) {
                currentEmployeeRate = Math.min(currentEmployeeRate + 1, maxAutoEscalationRate);
            }
            
            // Recalculate monthly contribution with current rate
            const currentMonthlyEmployeeContrib = (currentEmployeeRate / 100) * avgSalary / monthsPerYear;
            
            // Monthly compounding for the year
            for (let month = 0; month < monthsPerYear; month++) {
                // Add monthly contributions
                const monthlyContributions = currentMonthlyEmployeeContrib + monthlyEmployerContrib + monthlyMatchContrib;
                currentBalance += monthlyContributions;
                totalAnnualContributions += monthlyContributions;
                
                // Apply monthly investment return
                const monthlyGrowth = currentBalance * monthlyReturn;
                currentBalance += monthlyGrowth;
                totalInvestmentGrowth += monthlyGrowth;
            }
            
            // Deduct annual fees at year end
            currentBalance -= annualFeePerPerson;
            totalAnnualFees = annualFeePerPerson;
            
            // Store data for every 5 years (including year 0 and 25)
            if (year % 5 === 0 || year === years) {
                chartData.push({
                    year: year,
                    balance: currentBalance,
                    startingBalance: yearStartBalance,
                    contributions: totalAnnualContributions,
                    growth: totalInvestmentGrowth,
                    fees: totalAnnualFees
                });
            }
            
            // Store detailed annual data for table
            projections.push({
                year: year,
                startingBalance: yearStartBalance,
                contributions: totalAnnualContributions,
                growth: totalInvestmentGrowth,
                fees: totalAnnualFees,
                endingBalance: currentBalance
            });
        }
        
        return {
            annual: projections,
            chart: chartData,
            effectiveReturn: calculateEffectiveReturn(avgAccountBalance, currentBalance, years)
        };
    }
    
    function calculateEffectiveReturn(startBalance, endBalance, years) {
        if (startBalance <= 0 || years <= 0) return 0;
        return (Math.pow(endBalance / startBalance, 1 / years) - 1) * 100;
    }
    
    function updateSummaryCards(currentProjections, optimizedProjections, tenPercentProjections) {
        const startingBalance = currentProjections.annual[0].startingBalance;
        const currentEndingBalance = currentProjections.annual[currentProjections.annual.length - 1].endingBalance;
        const optimizedEndingBalance = optimizedProjections.annual[optimizedProjections.annual.length - 1].endingBalance;
        const tenPercentEndingBalance = tenPercentProjections.annual[tenPercentProjections.annual.length - 1].endingBalance;
        const bestCaseGain = tenPercentEndingBalance - currentEndingBalance;
        
        document.getElementById('startingBalance').textContent = formatCurrency(startingBalance);
        document.getElementById('currentEndingBalance').textContent = formatCurrency(currentEndingBalance);
        document.getElementById('optimizedEndingBalance').textContent = formatCurrency(optimizedEndingBalance);
        document.getElementById('tenPercentEndingBalance').textContent = formatCurrency(tenPercentEndingBalance);
        document.getElementById('bestCaseGain').textContent = formatCurrency(bestCaseGain);
    }
    
    function createChart(currentProjections, optimizedProjections, tenPercentProjections) {
        const ctx = document.getElementById('aabChart').getContext('2d');
        
        const chartLabels = currentProjections.chart.map(p => `Year ${p.year}`);
        const currentData = currentProjections.chart.map(p => p.balance);
        const optimizedData = optimizedProjections.chart.map(p => p.balance);
        const tenPercentData = tenPercentProjections.chart.map(p => p.balance);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Current Plan (Status Quo)',
                    data: currentData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }, {
                    label: 'Optimized (Max Match Participation)',
                    data: optimizedData,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#27ae60',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }, {
                    label: '10% Employee Contribution',
                    data: tenPercentData,
                    borderColor: '#e67e22',
                    backgroundColor: 'rgba(230, 126, 34, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#e67e22',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Average Account Balance Growth Comparison (25 Years)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            },
                            color: '#6c757d'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#6c757d'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#667eea',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return 'Balance: ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });
    }
    
    function createDeltaChart(currentProjections, optimizedProjections, tenPercentProjections) {
        const ctx = document.getElementById('deltaChart').getContext('2d');
        
        const chartLabels = currentProjections.chart.map(p => `Year ${p.year}`);
        
        // Calculate deltas compared to current plan
        const optimizedDeltas = currentProjections.chart.map((currentData, index) => {
            const optimizedData = optimizedProjections.chart[index];
            return optimizedData.balance - currentData.balance;
        });
        
        const tenPercentDeltas = currentProjections.chart.map((currentData, index) => {
            const tenPercentData = tenPercentProjections.chart[index];
            return tenPercentData.balance - currentData.balance;
        });
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Optimized Plan Improvement',
                    data: optimizedDeltas,
                    backgroundColor: 'rgba(39, 174, 96, 0.7)',
                    borderColor: '#27ae60',
                    borderWidth: 2
                }, {
                    label: '10% Contribution Improvement',
                    data: tenPercentDeltas,
                    backgroundColor: 'rgba(230, 126, 34, 0.7)',
                    borderColor: '#e67e22',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Additional Balance vs. Current Plan',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            },
                            color: '#6c757d'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Additional Balance ($)',
                            color: '#2c3e50',
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        ticks: {
                            color: '#6c757d'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#667eea',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': +' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });
    }
    
    function populateDataTable(currentProjections, optimizedProjections, tenPercentProjections) {
        const tbody = document.getElementById('projectionTableBody');
        tbody.innerHTML = '';
        
        // Show data for every 5 years
        currentProjections.chart.forEach((currentData, index) => {
            const optimizedData = optimizedProjections.chart[index];
            const tenPercentData = tenPercentProjections.chart[index];
            const optDifference = optimizedData.balance - currentData.balance;
            const tenPercentDifference = tenPercentData.balance - currentData.balance;
            
            const row = tbody.insertRow();
            row.insertCell(0).textContent = currentData.year;
            row.insertCell(1).textContent = formatCurrency(currentData.balance);
            row.insertCell(2).textContent = formatCurrency(optimizedData.balance);
            row.insertCell(3).textContent = formatCurrency(tenPercentData.balance);
            row.insertCell(4).textContent = formatCurrency(optDifference);
            row.insertCell(5).textContent = formatCurrency(tenPercentDifference);
        });
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
});

function goBack() {
    window.location.href = 'index.html';
}

function goToEngagement() {
    window.location.href = 'engagement.html';
}

function exportData() {
    const setupData = JSON.parse(localStorage.getItem('planSetupData') || '{}');
    const dataStr = JSON.stringify(setupData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'retirement-plan-data.json';
    link.click();
}