export const sendNewStoryNotification = async (
  storyTitle: string,
  storySlug: string,
) => {
  const ONE_SIGNAL_APP_ID = process.env.ONE_SIGNAL_APP_ID;
  const ONE_SIGNAL_REST_KEY = process.env.ONE_SIGNAL_REST_KEY;

  // Best-effort send if keys aren't configured yet (dev environment)
  if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_REST_KEY) {
    console.warn(
      "⚠️ OneSignal API keys not found, skipping push notification.",
    );
    return false;
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONE_SIGNAL_REST_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONE_SIGNAL_APP_ID,
        included_segments: ["Subscribed Users"],
        headings: { en: "New Story Available!" },
        contents: { en: `Listen to our newest story: ${storyTitle}` },
        url: `${process.env.NEXT_PUBLIC_APP_URL}/stories/${storySlug}`,
      }),
    });

    if (!response.ok) {
      console.error("OneSignal Error:", await response.text());
      return false;
    }

    return true;
  } catch (e) {
    console.error("OneSignal Exception:", e);
    return false;
  }
};
