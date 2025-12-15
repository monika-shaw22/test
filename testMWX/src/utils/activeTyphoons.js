import { APIs } from "./constatnt";
import { hideApiMessage, showApiMessage } from "./errorMessage";

export function populateTyphoonDropdown(data) {
    const dropdown = document.getElementById("activetyphoon");
    dropdown.innerHTML = ""; 

    const defaultOption = document.createElement("option");
    defaultOption.value = "default";
    defaultOption.textContent = "Select Active Typhoon";
    dropdown.appendChild(defaultOption);
    
    if (data && data.storms && data.storms.length > 0) {
        data.storms.forEach(storm => {
            const option = document.createElement("option");
            option.value = storm.govId; 
            option.textContent = storm.name;
            dropdown.appendChild(option);
        });
    }
}

export async function getActiveTyphoonData() {
    try {
        showApiMessage(`Fetching Active Typhoons...`)
        const activeTyphoons = await fetch(APIs.activeTyphoon);

        if (!activeTyphoons.ok) {
            throw new Error(`HTTP error! Status: ${activeTyphoons.status}`);
        }

        const result = await activeTyphoons.json();
        hideApiMessage()
        return result;
    } catch (error) {
        console.error("Failed to fetch active typhoon data:", error);
        showApiMessage("Failed to fetch Active Typhoons", 3000)
        return null;
    }
}