"use client";

import React, { useEffect, useState } from "react";
import { Joyride, CallBackProps, STATUS, Step } from "react-joyride";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface OnboardingTourProps {
  steps: Step[];
  tourId: string;
}

export default function OnboardingTour({ steps, tourId }: OnboardingTourProps) {
  const [run, setRun] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Check if the user has already completed this specific tour
            if (!data[`tourCompleted_${tourId}`]) {
              // Wait a second for the dashboard to render fully before starting
              setTimeout(() => setRun(true), 1500);
            }
          }
        } catch (error) {
          console.error("Error checking tour status:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [tourId]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      
      if (userUid) {
        try {
          // Write to Firebase so it syncs across all their devices
          await updateDoc(doc(db, "users", userUid), {
            [`tourCompleted_${tourId}`]: true,
          });
        } catch (error) {
          console.error("Error saving tour completion:", error);
        }
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#C5A059",
          textColor: "#333",
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: "#C5A059",
        },
        buttonBack: {
          color: "#6B1D2F",
        }
      }}
    />
  );
}
