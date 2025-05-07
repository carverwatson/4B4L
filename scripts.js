document.addEventListener('DOMContentLoaded', () => {
    const dataForm = document.getElementById('dataForm');
    const performanceSummary = document.getElementById('performanceSummary');
    const transactionHistory = document.getElementById('transactionHistory');

    // Initialize localStorage if empty
    if (!localStorage.getItem('propertyData')) {
        localStorage.setItem('propertyData', JSON.stringify({
            Morrison: [],
            Orange: [],
            Osthoff: [],
            Spring: []
        }));
    }

    // Handle form submission
    if (dataForm) {
        dataForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const property = document.getElementById('property').value;
            const entry = {
                date: document.getElementById('date').value,
                rent: parseFloat(document.getElementById('rent').value) || 0,
                lateFees: parseFloat(document.getElementById('lateFees').value) || 0,
                expenses: parseFloat(document.getElementById('expenses').value) || 0,
                taxes: parseFloat(document.getElementById('taxes').value) || 0,
                initialCost: parseFloat(document.getElementById('initialCost').value) || 0,
                renovations: parseFloat(document.getElementById('renovations').value) || 0,
                rentPaidOnTime: document.getElementById('rentPaidOnTime').value
            };

            const data = JSON.parse(localStorage.getItem('propertyData'));
            data[property].push(entry);
            localStorage.setItem('propertyData', JSON.stringify(data));
            alert('Data saved successfully!');
            dataForm.reset();
        });
    }

    // Display dashboard
    if (performanceSummary && transactionHistory) {
        const data = JSON.parse(localStorage.getItem('propertyData'));
        let summaryHTML = '<h3 class="text-xl font-semibold mb-2">Performance Summary</h3>';
        summaryHTML += '<table class="w-full border-collapse"><thead><tr class="bg-gray-200"><th class="border p-2">Property</th><th class="border p-2">Total Income</th><th class="border p-2">Total Expenses</th><th class="border p-2">Profit</th><th class="border p-2">ROI (%)</th></tr></thead><tbody>';
        
        let historyHTML = '';
        for (const property in data) {
            let totalIncome = 0;
            let totalExpenses = 0;
            let totalInitialCost = 0;
            historyHTML += `<h4 class="text-lg font-semibold mt-4">${property}</h4>`;
            historyHTML += '<table class="w-full border-collapse mb-4"><thead><tr class="bg-gray-200"><th class="border p-2">Date</th><th class="border p-2">Rent ($)</th><th class="border p-2">Late Fees ($)</th><th class="border p-2">Expenses ($)</th><th class="border p-2">Taxes ($)</th><th class="border p-2">Initial Cost ($)</th><th class="border p-2">Renovations ($)</th><th class="border p-2">Rent On Time</th></tr></thead><tbody>';
            
            data[property].forEach(entry => {
                totalIncome += entry.rent + entry.lateFees;
                totalExpenses += entry.expenses + entry.taxes + entry.renovations;
                totalInitialCost = entry.initialCost || totalInitialCost;
                historyHTML += `<tr><td class="border p-2">${entry.date}</td><td class="border p-2">${entry.rent.toFixed(2)}</td><td class="border p-2">${entry.lateFees.toFixed(2)}</td><td class="border p-2">${entry.expenses.toFixed(2)}</td><td class="border p-2">${entry.taxes.toFixed(2)}</td><td class="border p-2">${entry.initialCost.toFixed(2)}</td><td class="border p-2">${entry.renovations.toFixed(2)}</td><td class="border p-2">${entry.rentPaidOnTime}</td></tr>`;
            });

            const profit = totalIncome - totalExpenses;
            const roi = totalInitialCost ? ((profit / totalInitialCost) * 100).toFixed(2) : 0;
            summaryHTML += `<tr><td class="border p-2">${property}</td><td class="border p-2">${totalIncome.toFixed(2)}</td><td class="border p-2">${totalExpenses.toFixed(2)}</td><td class="border p-2">${profit.toFixed(2)}</td><td class="border p-2">${roi}</td></tr>`;
            historyHTML += '</tbody></table>';
        }

        summaryHTML += '</tbody></table>';
        performanceSummary.innerHTML = summaryHTML;
        transactionHistory.innerHTML = historyHTML;
    }
});
