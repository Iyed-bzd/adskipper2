(function() {
    console.log("YouTube Ad Skipper & Muter: Content script loaded.");

    let isAdPlaying = false; // Flag to track if an ad is currently perceived as playing
    let isMutedByExtension = false; // Flag to track if *we* muted the video

    // Function to mute the video player
    function muteVideo() {
        const videoElement = document.querySelector('video');
        if (videoElement && !videoElement.muted) {
            videoElement.muted = true;
            isMutedByExtension = true;
            // console.log("YouTube Ad Skipper & Muter: Video muted."); // Uncomment for debugging
        }
    }

    // Function to unmute the video player (for when ad is over)
    function unmuteVideo() {
        const videoElement = document.querySelector('video');
        // Only unmute if *we* muted it, and if no ad is currently playing
        if (videoElement && isMutedByExtension && !isAdPlaying) {
            videoElement.muted = false;
            isMutedByExtension = false;
            // console.log("YouTube Ad Skipper & Muter: Video unmuted."); // Uncomment for debugging
        }
    }

    // Function to click the skip ad button
    function clickSkipButton() {
        // These are common selectors. YOU MUST VERIFY THESE with DevTools!
        const skipButtonSelectors = [
            '.ytp-ad-skip-button-modern',       // Modern skip button
            '.ytp-ad-skip-button',              // Older skip button
            '.ytp-skip-ad-button',              // Another common class
            'button.ytp-skip-ad-button',        // More specific
            'div.ytp-ad-text[id="skip-button"] button', // If skip button is inside a div with id="skip-button"
            'button[aria-label*="Skip ad"]',    // More robust for different "Skip ad" texts
            '.ytp-ad-skip-button-slot button' // Sometimes the button is nested in a slot
        ];

        for (const selector of skipButtonSelectors) {
            const skipButton = document.querySelector(selector);
            // Check if button exists, is visible, and is not disabled
            if (skipButton && skipButton.offsetParent !== null && !skipButton.disabled) {
                // Also check if it's explicitly hidden by common styles (opacity/display/visibility)
                const style = window.getComputedStyle(skipButton);
                if (style.opacity !== '0' && style.display !== 'none' && style.visibility !== 'hidden') {
                    skipButton.click();
                    console.log(`YouTube Ad Skipper & Muter: Skip ad button clicked via selector: "${selector}"`);
                    return true; // Button found and clicked
                }
            }
        }
        return false; // No skip button found or clickable
    }

    // Function to detect if an ad is currently present/playing
    function detectAdPresence() {
        // Look for various ad-related elements that indicate an ad is active
        const adCountdown = document.querySelector('.ytp-ad-text'); // e.g., "Your video will resume in X seconds"
        const videoAdContainer = document.querySelector('.ytp-ad-module'); // Main ad module container
        const adOverlay = document.querySelector('.ytp-ad-player-overlay'); // Ad banner/overlay
        const prerollAd = document.querySelector('.ytp-ad-player-overlay-instream-info'); // Preroll info
        const mastheadAd = document.querySelector('#masthead-ad'); // Potential masthead ad container

        // A combination of these being visible suggests an ad
        return (videoAdContainer && videoAdContainer.offsetParent !== null) ||
               (adCountdown && adCountdown.offsetParent !== null) ||
               (adOverlay && adOverlay.offsetParent !== null) ||
               (prerollAd && prerollAd.offsetParent !== null) ||
               (mastheadAd && mastheadAd.offsetParent !== null); // Consider other ad types too
    }

    // Main loop for ad detection and action
    setInterval(() => {
        const currentAdPresence = detectAdPresence();

        if (currentAdPresence) {
            if (!isAdPlaying) {
                // Ad just started or reappeared
                console.log("YouTube Ad Skipper & Muter: Ad detected or re-detected. Muting...");
                isAdPlaying = true;
            }
            muteVideo();
            // Continuously try to skip as long as an ad is detected
            clickSkipButton();
        } else {
            // No ad detected
            if (isAdPlaying) {
                // Ad just ended (or was successfully skipped and no new ad loaded immediately)
                console.log("YouTube Ad Skipper & Muter: No ad detected. Unmuting...");
                isAdPlaying = false; // Reset the flag
            }
            unmuteVideo(); // Unmute if we were the ones who muted it
        }
    }, 250); // Increased frequency of checks to 250ms for faster reaction

    // Optional: Keep MutationObserver for broader DOM changes, but rely on setInterval for active checks
    // The setInterval is generally more effective for the timing-sensitive clicking.
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // You can add more specific logic here if certain ad types only trigger
            // specific DOM mutations that setInterval might miss.
            // For now, the setInterval should be robust enough.
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
