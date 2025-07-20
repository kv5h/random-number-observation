document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const chartCanvas = document.getElementById('dValueChart');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFilterButton = document.getElementById('applyFilter');
    let chartInstance = null;

    const API_ENDPOINT = '/api/get-d-values';

    // Set today's date (default value)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month starts from 0, so +1
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    startDateInput.value = formatDate(sevenDaysAgo);
    endDateInput.value = formatDate(today);

    async function fetchDValueData() {
        statusDiv.textContent = 'Loading data...';
        try {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;

            // Add date parameters to API endpoint
            const url = `${API_ENDPOINT}?startDate=${startDate}&endDate=${endDate}`;

            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const data = await response.json();

            if (!data || !Array.isArray(data) || data.length === 0) {
                statusDiv.textContent = 'No data available for the selected period.';
                if (chartInstance) {
                    chartInstance.destroy();
                    chartInstance = null;
                }
                return;
            }

            const labels = data.map((item) => new Date(item.timestamp).toLocaleString());
            const dValues = data.map((item) => item.d_value);

            // Calculate the max D value in the selected period, set y-axis max accordingly (with margin, but never above 1.0)
            const maxDValue = Math.max(...dValues);
            const yAxisMax = Math.min(1.0, Math.ceil((maxDValue + 0.05) * 100) / 100);

            if (chartInstance) {
                chartInstance.destroy();
            }

            chartInstance = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Randomness Bias (D value)',
                            data: dValues,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1,
                            fill: false,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Measurement DateTime',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'D value',
                            },
                            beginAtZero: true,
                            min: 0,
                            max: yAxisMax,
                        },
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `D value: ${context.parsed.y.toFixed(4)}`;
                                },
                            },
                        },
                    },
                },
            });
            statusDiv.textContent = 'Chart displayed.';
        } catch (error) {
            console.error('Error occurred while fetching D value data:', error);
            statusDiv.textContent = `Failed to load data: ${error.message}`;
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }
        }
    }

    // Fetch data on page load and when filter button is clicked
    applyFilterButton.addEventListener('click', fetchDValueData);
    fetchDValueData(); // Also fetch data on initial load
});
