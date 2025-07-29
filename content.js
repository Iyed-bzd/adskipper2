(function() {
    console.log("YouTube Ad Skipper & Muter: Content script loaded.");

    // Function to mute the video player
    function muteVideo() {
        const videoElement = document.querySelector('video');
        if (videoElement && !videoElement.muted) {
            videoElement.muted = true;
            console.log("YouTube Ad Skipper & Muter: Video muted.");
        }
    }

    // Function to unmute the video player (for when ad is over)
    function unmuteVideo() {
        const videoElement = document.querySelector('video');
        if (videoElement && videoElement.muted) {
            videoElement.muted = false;
            console.log("YouTube Ad Skipper & Muter: Video unmuted.");
        }
    }

    // Function to click the skip ad button
    function clickSkipButton() {
        // Common selectors for YouTube skip buttons
        const skipButtonSelectors = [
            '.ytp-ad-skip-button-modern', // Newer skip button
            '.ytp-ad-skip-button',      // Older skip button
            '.ytp-skip-ad-button'      // Another common skip button class
        ];

        for (const selector of skipButtonSelectors) {
            const skipButton = document.querySelector(selector);
            if (skipButton && skipButton.offsetParent !== null) { // Check if button is visible
                skipButton.click();
                console.log("YouTube Ad Skipper & Muter: Skip ad button clicked.");
                return true; // Button found and clicked
            }
        }
        return false; // No skip button found
    }

    // Observe changes in the DOM to detect ad elements
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length || mutation.removedNodes.length) {
                // Check for ad-related elements
                const adOverlay = document.querySelector('.ytp-ad-player-overlay'); // Ad overlay (e.g., banner)
                const adCountdown = document.querySelector('.ytp-ad-text'); // Ad countdown text
                const videoAdContainer = document.querySelector('.ytp-ad-module'); // Ad container

                const isAdPlaying = (videoAdContainer && videoAdContainer.offsetParent !== null) ||
                                    (adCountdown && adCountdown.offsetParent !== null) ||
                                    (adOverlay && adOverlay.offsetParent !== null);

                if (isAdPlaying) {
                    muteVideo();
                    clickSkipButton();
                } else {
                    // If no ad elements are visible, unmute the video
                    unmuteVideo();
                }
            }
        });
    });

    // Start observing the body for changes
    // We observe the body because ad elements can be added anywhere in the player
    observer.observe(document.body, { childList: true, subtree: true });

    // Also, periodically check in case MutationObserver misses something or for initial load
    setInterval(() => {
        const adCountdown = document.querySelector('.ytp-ad-text');
        const videoAdContainer = document.querySelector('.ytp-ad-module');
        const adOverlay = document.querySelector('.ytp-ad-player-overlay');

        const isAdPlaying = (videoAdContainer && videoAdContainer.offsetParent !== null) ||
                            (adCountdown && adCountdown.offsetParent !== null) ||
                            (adOverlay && adOverlay.offsetParent !== null);

        if (isAdPlaying) {
            muteVideo();
            clickSkipButton();
        } else {
            unmuteVideo();
        }
    }, 1000); // Check every 1 second
})();