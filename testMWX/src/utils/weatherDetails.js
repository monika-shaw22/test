import { APIs } from "./constatnt";
import { hideApiMessage, showApiMessage } from "./errorMessage";

let aqiData = [];
let chartInstance = null;
let pollutantChartInstance = null;

function formatDateTime(datetimeStr) {
    const date = new Date(datetimeStr.replace(" ", "T"));
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-US', options);
}

export async function getWeatherAndAQIDetails() {
    try {
        showApiMessage(`Fetching Weather Details for Manila...`)
        const res = await fetch(APIs.Weather);
        const data = await res.json();
        hideApiMessage()

        document.getElementById("location").textContent = `${data.location.region}, ${data.location.country}`;
        document.getElementById("formattedTime").textContent = formatDateTime(data.location.localtime);

        document.getElementById("temperature").textContent = `${data.weather.temperature_c}°C`;
        document.getElementById("condition").textContent = data.weather.condition;
        document.getElementById("uv").textContent = data.weather.uv_index;
        document.getElementById("wind").textContent = `${data.weather.wind_kph} kph`;
        document.getElementById("humidity").textContent = `${data.weather.humidity}%`;
        // Weather image logic
        const condition = data.weather.condition.toLowerCase();
        const imageElement = document.getElementById("weatherImage");
        if (condition.includes("rain")) {
            imageElement.src = "/rain.gif";
        } else if (condition.includes("sunny")) {
            imageElement.src = "/sunny.gif";
        } else if (condition.includes("cloud")) {
            imageElement.src = "/cloud.gif";
        } else if (condition.includes("thunder")) {
            imageElement.src = "/thunder.gif";
        } else {
            imageElement.src = "/sunny.gif";
        }

        if (data.alerts && data.alerts.length > 0) {
            const alert = data.alerts[0];
            document.getElementById("alertHeadline").textContent = alert.headline;
            document.getElementById("alertEvent").textContent = alert.event;
            document.getElementById("alertSeverity").textContent = alert.severity;
            document.getElementById("alertExpires").textContent = alert.expires
                ? formatDateTime(alert.expires)
                : "N/A";
            document.getElementById("alertDescription").textContent = alert.description;
            document.getElementById("alertInstruction").textContent = alert.instruction;

            document.getElementById("alertsPopup").style.display = "block";
        } else {
            document.getElementById("alertsPopup").style.display = "none";
        }

        if (data.aqi_info && data.aqi_info.hourlyForecasts) {
            aqiData = data.aqi_info.hourlyForecasts;

            populateDateSelector(aqiData);

            drawAqiChart(aqiData, document.getElementById("dateSelector").value);
        }

    } catch (error) {
        showApiMessage("Failed to fetch Weather Details", 3000)
        console.error("Error fetching weather:", error);
    }
}


function populateDateSelector(hourlyForecasts) {
    const selector = document.getElementById("dateSelector");
    const uniqueDates = [...new Set(hourlyForecasts.map(f => f.dateTime.split("T")[0]))];
    selector.min = uniqueDates[0];
    selector.max = uniqueDates[uniqueDates.length - 1];
    selector.value = uniqueDates[0];
    populateHourSelector(selector.value);
    selector.addEventListener("change", (e) => {
        populateHourSelector(e.target.value);
        drawAqiChart(aqiData, e.target.value);
    });
}

function populateHourSelector(selectedDate) {
    const selector = document.getElementById("hourSelector");
    selector.innerHTML = "";
    const filtered = aqiData.filter(f => f.dateTime.startsWith(selectedDate));
    filtered.forEach(forecast => {
        const option = document.createElement("option");
        const date = new Date(forecast.dateTime);
        option.value = forecast.dateTime;
        option.textContent = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        selector.appendChild(option);
    });
    if (filtered.length > 0) updateAqiDetails(filtered[0].dateTime);
    selector.addEventListener("change", (e) => updateAqiDetails(e.target.value));
}

function updateAqiDetails(dateTime) {
    const forecast = aqiData.find(f => f.dateTime === dateTime);
    if (!forecast) return;
    const indexData = forecast.indexes.find(i => i.code === "uaqi");
    const r = Math.round(indexData.color.red * 255);
    const g = Math.round(indexData.color.green * 255);
    const b = Math.round(indexData.color.blue * 255);

    const aqiValueEl = document.getElementById("aqiValue");
    aqiValueEl.textContent = `AQI: ${indexData.aqi}`;
    aqiValueEl.style.backgroundColor = `rgb(${r},${g},${b})`;
    aqiValueEl.style.color = "white";

    const catEl = document.getElementById("aqiCategory");
    catEl.textContent = indexData.category;
    catEl.style.color = `rgb(${r},${g},${b})`;

    document.getElementById("aqiDominant").textContent = indexData.dominantPollutant;

    const healthRecs = document.getElementById("healthRecs");
    healthRecs.innerHTML = "";
    Object.entries(forecast.healthRecommendations).forEach(([group, text]) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${group.replace(/([A-Z])/g, ' $1')}:</strong> ${text}`;
        healthRecs.appendChild(li);
    });

    drawPollutantChart(forecast.pollutants);
}

function drawAqiChart(hourlyForecasts, selectedDate) {
    const ctx = document.getElementById("aqiChart").getContext("2d");
    const filtered = hourlyForecasts.filter(f => f.dateTime.startsWith(selectedDate));
    const times = filtered.map(f => new Date(f.dateTime).toLocaleTimeString("en-US", { hour: "2-digit" }));
    const values = filtered.map(f => f.indexes[0].aqi);
    const colors = filtered.map(f => {
        const c = f.indexes[0].color;
        return `rgb(${Math.round(c.red * 255)}, ${Math.round(c.green * 255)}, ${Math.round(c.blue * 255)})`;
    });
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'AQI Forecast',
                data: values,
                borderColor: colors,
                pointBackgroundColor: colors,
                borderWidth: 2,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'white'
                    }
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'white'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'white'
                    }
                }
            }
        }
    });
}

function drawPollutantChart(pollutants) {
    const ctx = document.getElementById("pollutantChart").getContext("2d");
    const labels = pollutants.map(p => p.displayName);
    const values = pollutants.map(p => p.concentration.value);
    const units = pollutants.map(p => p.concentration.units);

    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];
    const borderColors = backgroundColors.map(c => c.replace("0.7", "1"));
    if (pollutantChartInstance) pollutantChartInstance.destroy();
    pollutantChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Concentration',
                data: values,
                backgroundColor: backgroundColors.slice(0, values.length),
                borderColor: borderColors.slice(0, values.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'white'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.parsed.y + " " + units[context.dataIndex];
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'white'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'white'
                    }
                }
            }
        }
    });
}
