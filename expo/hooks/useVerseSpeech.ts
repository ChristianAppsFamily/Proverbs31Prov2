import * as Speech from "expo-speech";
import { useCallback, useEffect, useState } from "react";

export function useVerseSpeech() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      Speech.stop().catch(() => {});
    };
  }, []);

  const speak = useCallback(async (text: string) => {
    try {
      setIsLoading(true);
      const speaking = await Speech.isSpeakingAsync();
      if (speaking) {
        await Speech.stop();
        setIsPlaying(false);
        setIsLoading(false);
        return;
      }
      Speech.speak(text, {
        rate: 0.92,
        pitch: 1.0,
        onStart: () => {
          setIsPlaying(true);
          setIsLoading(false);
        },
        onDone: () => setIsPlaying(false),
        onStopped: () => setIsPlaying(false),
        onError: () => {
          setIsPlaying(false);
          setIsLoading(false);
        },
      });
    } catch (e) {
      console.log("[speech] error", e);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, []);

  return { isPlaying, isLoading, speak };
}
