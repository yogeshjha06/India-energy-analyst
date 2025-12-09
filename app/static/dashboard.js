// API Base URL
const API_BASE = '';

// Global data storage
let capacityData = null;
let generationData = null;
let transmissionData = null;
let mapData = null;

// Tab switching
function showTab(tabName) {
    // Remove active class from all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to the selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to the clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Fetch all data
async function fetchAllData() {
    try {
        console.log('Fetching data...');
        const [capacity, generation, transmission, map] = await Promise.all([
            fetch(`${API_BASE}/npp/installed-capacity`).then(r => r.json()),
            fetch(`${API_BASE}/npp/generation-chart`).then(r => r.json()),
            fetch(`${API_BASE}/npp/transmission`).then(r => r.json()),
            fetch(`${API_BASE}/npp/map-data`).then(r => r.json())
        ]);
        
        capacityData = capacity;
        generationData = generation;
        transmissionData = transmission;
        mapData = map;
        
        console.log('Data loaded:', { capacity, generation, transmission, map });
        
        updateKPIs();
        createCharts();
        createDataTable();
        
        console.log('Dashboard initialized successfully');
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading dashboard data. Please check console.');
    }
}

// Update KPI cards
function updateKPIs() {
    try {
        const latest = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 1];
        const totalCapacity = latest.installed_capacity_thermal + latest.installed_capacity_hydro + 
                             latest.installed_capacity_nuclear + latest.installed_capacity_res;
        
        document.getElementById('totalCapacity').textContent = Math.round(totalCapacity).toLocaleString();
        
        // Use capacity data as fallback for online capacity
        const onlineCapacity = mapData?.headerMap?.CP_OBJ?.online_capacity || (totalCapacity * 0.85);
        document.getElementById('onlineCapacity').textContent = Math.round(onlineCapacity).toLocaleString();
        
        // Use generation data as fallback
        const latestGen = generationData.linechartforGeneration[generationData.linechartforGeneration.length - 1];
        const todayGen = mapData?.headerMap?.GN_OBJ?.actual_generation || 
                        (latestGen.thermal_total + latestGen.hydro + latestGen.nuclear + latestGen.renewable_energy_sources) / 365;
        document.getElementById('todayGeneration').textContent = Math.round(todayGen).toLocaleString();
        
        document.getElementById('renewableShare').textContent = 
            ((latest.installed_capacity_res / totalCapacity) * 100).toFixed(1) + '%';
    } catch (error) {
        console.error('Error updating KPIs:', error);
    }
}

// Create all charts
function createCharts() {
    try {
        console.log('Creating charts...');
        createEnergyMixChart();
        createCapacityStatusChart();
        createCapacityGrowthChart();
        createGenerationTrendsChart();
        createThermalVsRenewableChart();
        createGenerationMixChart();
        createVoltageDistChart();
        createTransmissionGrowthChart();
        console.log('All charts created');
    } catch (error) {
        console.error('Error creating charts:', error);
    }
}

// Energy Mix Pie Chart
function createEnergyMixChart() {
    const latest = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 1];
    const ctx = document.getElementById('energyMixChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Thermal', 'Renewable', 'Hydro', 'Nuclear'],
            datasets: [{
                data: [
                    latest.installed_capacity_thermal,
                    latest.installed_capacity_res,
                    latest.installed_capacity_hydro,
                    latest.installed_capacity_nuclear
                ],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.parsed.toLocaleString()} MW`
                    }
                }
            }
        }
    });
}

// Capacity Status Doughnut Chart (using latest capacity data)
function createCapacityStatusChart() {
    const ctx = document.getElementById('capacityStatusChart').getContext('2d');
    const latest = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 1];
    const previous = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 2];
    
    const currentTotal = latest.installed_capacity_thermal + latest.installed_capacity_hydro + 
                        latest.installed_capacity_nuclear + latest.installed_capacity_res;
    const previousTotal = previous.installed_capacity_thermal + previous.installed_capacity_hydro + 
                         previous.installed_capacity_nuclear + previous.installed_capacity_res;
    const growth = currentTotal - previousTotal;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Current Capacity', 'Growth from Previous Year'],
            datasets: [{
                data: [previousTotal, growth],
                backgroundColor: ['#667eea', '#4CAF50']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${Math.round(context.parsed).toLocaleString()} MW`
                    }
                }
            }
        }
    });
}

// Historical Capacity Growth Area Chart
function createCapacityGrowthChart() {
    const ctx = document.getElementById('capacityGrowthChart').getContext('2d');
    const data = capacityData.linechartforCapacity;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => new Date(d.reporting_date).getFullYear()),
            datasets: [
                {
                    label: 'Thermal',
                    data: data.map(d => d.installed_capacity_thermal),
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true
                },
                {
                    label: 'Renewable',
                    data: data.map(d => d.installed_capacity_res),
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true
                },
                {
                    label: 'Hydro',
                    data: data.map(d => d.installed_capacity_hydro),
                    borderColor: '#FFCE56',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    fill: true
                },
                {
                    label: 'Nuclear',
                    data: data.map(d => d.installed_capacity_nuclear),
                    borderColor: '#4BC0C0',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    stacked: true,
                    title: { display: true, text: 'Capacity (MW)' }
                }
            }
        }
    });
}

// Generation Trends Line Chart
function createGenerationTrendsChart() {
    const ctx = document.getElementById('generationTrendsChart').getContext('2d');
    const data = generationData.linechartforGeneration;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.financial_year),
            datasets: [
                {
                    label: 'Thermal',
                    data: data.map(d => d.thermal_total),
                    borderColor: '#FF6384',
                    tension: 0.4
                },
                {
                    label: 'Renewable',
                    data: data.map(d => d.renewable_energy_sources),
                    borderColor: '#36A2EB',
                    tension: 0.4
                },
                {
                    label: 'Hydro',
                    data: data.map(d => d.hydro),
                    borderColor: '#FFCE56',
                    tension: 0.4
                },
                {
                    label: 'Nuclear',
                    data: data.map(d => d.nuclear),
                    borderColor: '#4BC0C0',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    title: { display: true, text: 'Generation (MU)' }
                }
            }
        }
    });
}

// Thermal vs Renewable Bar Chart
function createThermalVsRenewableChart() {
    const ctx = document.getElementById('thermalVsRenewableChart').getContext('2d');
    const data = generationData.linechartforGeneration.slice(-10);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.financial_year),
            datasets: [
                {
                    label: 'Thermal',
                    data: data.map(d => d.thermal_total),
                    backgroundColor: '#FF6384'
                },
                {
                    label: 'Renewable',
                    data: data.map(d => d.renewable_energy_sources),
                    backgroundColor: '#36A2EB'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
}

// Generation Mix Pie Chart
function createGenerationMixChart() {
    const ctx = document.getElementById('generationMixChart').getContext('2d');
    const latest = generationData.linechartforGeneration[generationData.linechartforGeneration.length - 1];
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Thermal', 'Renewable', 'Hydro', 'Nuclear'],
            datasets: [{
                data: [latest.thermal_total, latest.renewable_energy_sources, latest.hydro, latest.nuclear],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Voltage Distribution Bar Chart
function createVoltageDistChart() {
    const ctx = document.getElementById('voltageDistChart').getContext('2d');
    
    if (!transmissionData.mapTLine || !transmissionData.mapTLine.transLineList) {
        console.warn('Transmission line data not available');
        return;
    }
    
    const data = transmissionData.mapTLine.transLineList;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.voltage_level),
            datasets: [{
                label: 'Transmission Lines (ckm)',
                data: data.map(d => d.transmission_line_ckm_cumm),
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    title: { display: true, text: 'Circuit Kilometers' }
                }
            }
        }
    });
}

// Transmission Growth Line Chart
function createTransmissionGrowthChart() {
    const ctx = document.getElementById('transmissionGrowthChart').getContext('2d');
    
    if (!transmissionData.mapTLine || !transmissionData.mapTLine.yTransList) {
        console.warn('Transmission growth data not available');
        return;
    }
    
    const data = transmissionData.mapTLine.yTransList;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.fin_year_id_print),
            datasets: [{
                label: 'Total Lines (ckm)',
                data: data.map(d => d.transmission_line_intra_state_ckm_cum),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Create Data Tables
function createDataTable() {
    createCapacityTable();
    createTransmissionVoltageTable();
    createTransmissionGrowthTable();
    createGenTrendsTable();
    createCapStatusTable();
}

function createCapacityTable() {
    const el = document.getElementById('capacityTable');
    if (!el) return;
    const latest = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 1];
    const total = latest.installed_capacity_thermal + latest.installed_capacity_hydro + latest.installed_capacity_nuclear + latest.installed_capacity_res;
    el.innerHTML = `<table><thead><tr><th>Source</th><th>Capacity (MW)</th><th>Share (%)</th></tr></thead><tbody>
        <tr><td>Thermal</td><td>${latest.installed_capacity_thermal.toLocaleString()}</td><td>${((latest.installed_capacity_thermal/total)*100).toFixed(1)}%</td></tr>
        <tr><td>Renewable</td><td>${latest.installed_capacity_res.toLocaleString()}</td><td>${((latest.installed_capacity_res/total)*100).toFixed(1)}%</td></tr>
        <tr><td>Hydro</td><td>${latest.installed_capacity_hydro.toLocaleString()}</td><td>${((latest.installed_capacity_hydro/total)*100).toFixed(1)}%</td></tr>
        <tr><td>Nuclear</td><td>${latest.installed_capacity_nuclear.toLocaleString()}</td><td>${((latest.installed_capacity_nuclear/total)*100).toFixed(1)}%</td></tr>
    </tbody></table>`;
}

function createTransmissionVoltageTable() {
    const el = document.getElementById('transmissionVoltageTable');
    if (!el || !transmissionData.mapTLine?.transLineList) return;
    const data = transmissionData.mapTLine.transLineList;
    el.innerHTML = `<table><thead><tr><th>Voltage Level</th><th>Lines (ckm)</th></tr></thead><tbody>${data.map(d => `<tr><td>${d.voltage_level}</td><td>${d.transmission_line_ckm_cumm.toLocaleString()}</td></tr>`).join('')}</tbody></table>`;
}

function createTransmissionGrowthTable() {
    const el = document.getElementById('transmissionGrowthTable');
    if (!el || !transmissionData.mapTLine?.yTransList) return;
    const data = transmissionData.mapTLine.yTransList;
    el.innerHTML = `<table><thead><tr><th>Year</th><th>Lines (ckm)</th></tr></thead><tbody>${data.map(d => `<tr><td>${d.fin_year_id_print}</td><td>${d.transmission_line_intra_state_ckm_cum.toLocaleString()}</td></tr>`).join('')}</tbody></table>`;
}

function createGenTrendsTable() {
    const el = document.getElementById('genTrendsTable');
    if (!el) return;
    const data = generationData.linechartforGeneration.slice(-10);
    el.innerHTML = `<table><thead><tr><th>Year</th><th>Thermal (MU)</th><th>Renewable (MU)</th><th>Hydro (MU)</th><th>Nuclear (MU)</th></tr></thead><tbody>${data.map(d => `<tr><td>${d.financial_year}</td><td>${d.thermal_total.toLocaleString()}</td><td>${d.renewable_energy_sources.toLocaleString()}</td><td>${d.hydro.toLocaleString()}</td><td>${d.nuclear.toLocaleString()}</td></tr>`).join('')}</tbody></table>`;
}

function createCapStatusTable() {
    const el = document.getElementById('capStatusTable');
    if (!el) return;
    const latest = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 1];
    const previous = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 2];
    const current = latest.installed_capacity_thermal + latest.installed_capacity_hydro + latest.installed_capacity_nuclear + latest.installed_capacity_res;
    const prev = previous.installed_capacity_thermal + previous.installed_capacity_hydro + previous.installed_capacity_nuclear + previous.installed_capacity_res;
    el.innerHTML = `<table><thead><tr><th>Status</th><th>Capacity (MW)</th></tr></thead><tbody><tr><td>Current Total</td><td>${current.toLocaleString()}</td></tr><tr><td>Previous Year</td><td>${prev.toLocaleString()}</td></tr><tr><td>Growth</td><td>${(current - prev).toLocaleString()}</td></tr></tbody></table>`;
}

// Chart instances
let charts = {};

// Toggle view between table/pie/bar
function toggleView(section, type) {
    ['Table', 'Pie', 'Bar'].forEach(t => {
        const el = document.getElementById(`${section}${t}`);
        if (el) el.style.display = 'none';
        const parent = el?.parentElement;
        if (parent && parent.style.maxWidth) parent.style.display = 'none';
    });
    const target = document.getElementById(`${section}${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (target) {
        target.style.display = 'block';
        if (target.parentElement?.style.maxWidth) target.parentElement.style.display = 'block';
    }
    
    if (type === 'pie') createPieChart(section);
    if (type === 'bar') createBarChart(section);

}

function createPieChart(section) {
    const id = `${section}Pie`;
    if (charts[id]) charts[id].destroy();
    
    let data, labels;
    if (section === 'capacity') {
        const latest = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 1];
        labels = ['Thermal', 'Renewable', 'Hydro', 'Nuclear'];
        data = [latest.installed_capacity_thermal, latest.installed_capacity_res, latest.installed_capacity_hydro, latest.installed_capacity_nuclear];
    } else if (section === 'transmissionVoltage') {
        const tData = transmissionData.mapTLine.transLineList;
        labels = tData.map(d => d.voltage_level);
        data = tData.map(d => d.transmission_line_ckm_cumm);
    } else if (section === 'capStatus') {
        const latest = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 1];
        const previous = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 2];
        const current = latest.installed_capacity_thermal + latest.installed_capacity_hydro + latest.installed_capacity_nuclear + latest.installed_capacity_res;
        const prev = previous.installed_capacity_thermal + previous.installed_capacity_hydro + previous.installed_capacity_nuclear + previous.installed_capacity_res;
        labels = ['Previous Year', 'Growth'];
        data = [prev, current - prev];
    }
    
    charts[id] = new Chart(document.getElementById(id), {
        type: 'pie',
        data: {
            labels,
            datasets: [{ data, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
    });
}

function createBarChart(section) {
    const id = `${section}Bar`;
    if (charts[id]) charts[id].destroy();
    
    let data, labels, datasets;
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#4BC0C0'];
    
    if (section === 'capacity') {
        const latest = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 1];
        labels = ['Thermal', 'Renewable', 'Hydro', 'Nuclear'];
        data = [latest.installed_capacity_thermal, latest.installed_capacity_res, latest.installed_capacity_hydro, latest.installed_capacity_nuclear];
        datasets = [{ label: 'Capacity (MW)', data, backgroundColor: colors }];
    } else if (section === 'transmissionVoltage') {
        const tData = transmissionData.mapTLine.transLineList;
        labels = tData.map(d => d.voltage_level);
        data = tData.map(d => d.transmission_line_ckm_cumm);
        datasets = [{ label: 'Lines (ckm)', data, backgroundColor: colors }];
    } else if (section === 'transmissionGrowth') {
        const tData = transmissionData.mapTLine.yTransList;
        labels = tData.map(d => d.fin_year_id_print);
        data = tData.map(d => d.transmission_line_intra_state_ckm_cum);
        datasets = [{ label: 'Lines (ckm)', data, backgroundColor: colors }];
    } else if (section === 'genTrends') {
        const gData = generationData.linechartforGeneration.slice(-10);
        labels = gData.map(d => d.financial_year);
        datasets = [
            { label: 'Thermal', data: gData.map(d => d.thermal_total), backgroundColor: '#FF6384' },
            { label: 'Renewable', data: gData.map(d => d.renewable_energy_sources), backgroundColor: '#36A2EB' },
            { label: 'Hydro', data: gData.map(d => d.hydro), backgroundColor: '#FFCE56' },
            { label: 'Nuclear', data: gData.map(d => d.nuclear), backgroundColor: '#4BC0C0' }
        ];
    }
    
    charts[id] = new Chart(document.getElementById(id), {
        type: 'bar',
        data: { labels, datasets },
        options: { responsive: true, maintainAspectRatio: true }
    });
}

function exportTableCSV(tableId, filename) {
    const table = document.getElementById(tableId).querySelector('table');
    let csv = [];
    table.querySelectorAll('tr').forEach(row => {
        csv.push([...row.querySelectorAll('th, td')].map(cell => cell.textContent).join(','));
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

// Handle state button clicks
document.addEventListener('DOMContentLoaded', function() {
    const stateButtons = document.querySelectorAll('.state-btn');
    stateButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            stateButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const stateName = this.getAttribute('data-state');
            document.getElementById('stateTitle').textContent = stateName;
            document.getElementById('stateInfo').textContent = `Energy data for ${stateName} will be displayed here. Integration with state-specific APIs coming soon.`;
            document.getElementById('stateDetails').style.display = 'block';
            
            console.log('State selected:', stateName);
        });
    });
});

let webSearchEnabled = false;

function toggleWeb() {
    webSearchEnabled = !webSearchEnabled;
    const btn = document.getElementById('webToggle');
    if (webSearchEnabled) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
}



async function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    
    const chatBox = document.getElementById('chatMessages');
    chatBox.innerHTML += `<div style="margin-bottom:10px; text-align:right;"><span style="background:#667eea; color:#fff; padding:8px 12px; border-radius:15px; display:inline-block;">${msg}</span></div>`;
    input.value = '';
    
    const chartData = getSelectedChartData();
    
    chatBox.innerHTML += `<div style="margin-bottom:10px;"><span style="background:#f0f0f0; padding:8px 12px; border-radius:15px; display:inline-block;">Thinking...</span></div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    
    try {
        const res = await fetch('/gargi/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: msg, use_web_search: webSearchEnabled, chart_data: chartData })
        });
        const data = await res.json();
        
        chatBox.lastChild.remove();
        
        // Parse response for chart data
        let responseText = data.response;
        let chartJSON = null;
        
        // Try to extract JSON chart data from response
        const jsonMatch = responseText.match(/\{"chart"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                chartJSON = JSON.parse(jsonMatch[0]);
                // Remove JSON from response text
                responseText = responseText.replace(jsonMatch[0], '').trim();
            } catch (e) {
                // JSON parse failed, treat as regular response
            }
        }
        
        // Display text response
        const msgId = `msg-${Date.now()}`;
        chatBox.innerHTML += `<div style="margin-bottom:10px;"><span style="background:#f0f0f0; padding:8px 12px; border-radius:15px; display:inline-block;">${responseText.replace(/\n/g, '<br>')}</span></div>`;
        
        // Display chart if found
        if (chartJSON && chartJSON.chart) {
            const chartDiv = document.createElement('div');
            chartDiv.style.cssText = 'margin:15px 0; padding:15px; background:#fafafa; border-radius:10px; max-width:700px;';
            chartDiv.innerHTML = `<canvas id="chat-chart-${msgId}"></canvas>`;
            chatBox.appendChild(chartDiv);
            
            // Render chart after DOM update
            setTimeout(() => {
                renderChatChart(`chat-chart-${msgId}`, chartJSON.chart);
            }, 0);
        }
        
        // Display sources as clickable links
        if (data.sources?.length) {
            let sourcesHTML = '<div style="margin-bottom:10px; font-size:12px; color:#666; margin-top:10px;"><strong>Sources:</strong> ';
            sourcesHTML += data.sources.map(source => {
                // Check if source is NPP Data (don't make it clickable)
                if (source.toLowerCase().includes('npp') || source.toLowerCase().includes('national power portal')) {
                    return `<span>${source}</span>`;
                }
                // Try to extract URL or make it clickable
                const urlMatch = source.match(/https?:\/\/[^\s]+/);
                if (urlMatch) {
                    return `<a href="${urlMatch[0]}" target="_blank" style="color:#667eea; text-decoration:underline;">${source}</a>`;
                }
                return `<a href="https://www.google.com/search?q=${encodeURIComponent(source)}" target="_blank" style="color:#667eea; text-decoration:underline;">${source}</a>`;
            }).join(', ');
            sourcesHTML += '</div>';
            chatBox.innerHTML += sourcesHTML;
        }
    } catch (err) {
        chatBox.lastChild.remove();
        chatBox.innerHTML += `<div style="margin-bottom:10px;"><span style="background:#ff6b6b; color:#fff; padding:8px 12px; border-radius:15px; display:inline-block;">Error: ${err.message}</span></div>`;
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Render chart from JSON data
function renderChatChart(canvasId, chartConfig) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    try {
        // Ensure chartConfig has required properties
        const config = {
            type: chartConfig.type || 'bar',
            data: {
                labels: chartConfig.labels || [],
                datasets: chartConfig.datasets || []
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: !!chartConfig.title,
                        text: chartConfig.title || ''
                    }
                },
                scales: chartConfig.type !== 'pie' ? {
                    y: {
                        beginAtZero: true
                    }
                } : undefined
            }
        };
        
        // Destroy existing chart if it exists
        if (window.chatCharts && window.chatCharts[canvasId]) {
            window.chatCharts[canvasId].destroy();
        }
        
        // Initialize chart storage
        if (!window.chatCharts) {
            window.chatCharts = {};
        }
        
        // Create new chart
        const ctx = canvas.getContext('2d');
        window.chatCharts[canvasId] = new Chart(ctx, config);
    } catch (error) {
        console.error('Error rendering chart:', error);
    }
}

function getSelectedChartData() {
    const selected = {};
    document.querySelectorAll('.chart-context:checked').forEach(cb => {
        const section = cb.dataset.section;
        if (section === 'capacity') {
            const latest = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 1];
            selected.capacity = { thermal: latest.installed_capacity_thermal, renewable: latest.installed_capacity_res, hydro: latest.installed_capacity_hydro, nuclear: latest.installed_capacity_nuclear };
        } else if (section === 'transmissionVoltage') {
            selected.transmissionVoltage = transmissionData.mapTLine.transLineList;
        } else if (section === 'transmissionGrowth') {
            selected.transmissionGrowth = transmissionData.mapTLine.yTransList;
        } else if (section === 'genTrends') {
            selected.genTrends = generationData.linechartforGeneration.slice(-10);
        } else if (section === 'capStatus') {
            const latest = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 1];
            const previous = capacityData.linechartforCapacity[capacityData.linechartforCapacity.length - 2];
            selected.capStatus = { current: latest, previous };
        }
    });
    return Object.keys(selected).length ? selected : null;
}

document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Initialize dashboard
fetchAllData();
