export function showApiMessage(msg, duration = 0) {
    const el = document.getElementById("api-message");
    el.innerText = msg;
    el.style.display = "block";
    if (duration > 0) {
        setTimeout(() => {
            el.style.display = "none";
        }, duration);
    }
}
export function hideApiMessage() {
    const el = document.getElementById("api-message");
    el.style.display = "none";
}