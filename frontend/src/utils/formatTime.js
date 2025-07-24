function formatTime(seconds) {
    if (seconds < 0) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        if (minutes > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${hours}h`;
        }
    }

    if (minutes > 0) {
        return `${minutes}m`;
    }
    return `${remainingSeconds}s`;
}

export { formatTime };