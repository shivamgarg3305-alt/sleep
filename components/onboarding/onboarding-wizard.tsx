"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { saveOnboardingProfile, skipOnboarding } from "@/app/actions/profile";

interface OnboardingWizardProps {
  initial: {
    biologicalSex: string | null;
    heightCm: number | null;
    weightKg: number | null;
    dateOfBirth: Date | null;
  };
}

const STEPS = ["sex", "height", "weight", "birthday"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingWizard({ initial }: OnboardingWizardProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const [sex, setSex] = useState<"female" | "male" | null>(
    initial.biologicalSex === "female" || initial.biologicalSex === "male"
      ? initial.biologicalSex
      : null
  );
  const [heightCm, setHeightCm] = useState(initial.heightCm ?? 170);
  const [weightKg, setWeightKg] = useState(initial.weightKg ?? 65);
  const [dob, setDob] = useState(
    initial.dateOfBirth
      ? initial.dateOfBirth.toISOString().slice(0, 10)
      : "2000-01-01"
  );

  const step: Step = STEPS[stepIndex] ?? "sex";
  const isLastStep = stepIndex === STEPS.length - 1;

  function handleSkip() {
    startTransition(async () => {
      const result = await skipOnboarding();
      if (result.success) {
        router.push("/dashboard");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleNext() {
    if (step === "sex" && !sex) {
      toast.error("Pick one to continue.");
      return;
    }

    if (!isLastStep) {
      setStepIndex((i) => i + 1);
      return;
    }

    if (!sex) return;
    startTransition(async () => {
      const result = await saveOnboardingProfile({
        biologicalSex: sex,
        heightCm,
        weightKg,
        dateOfBirth: new Date(dob),
      });
      if (result.success) {
        toast.success("Profile saved.");
        router.push("/dashboard");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 py-8">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i <= stepIndex ? "bg-primary" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleSkip}
          disabled={isPending}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Skip
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex w-full max-w-sm flex-col items-center"
          >
            {step === "sex" && <SexStep value={sex} onChange={setSex} />}
            {step === "height" && (
              <MeasurementStep
                question="What is your height?"
                value={heightCm}
                unit="cm"
                min={120}
                max={220}
                onChange={setHeightCm}
              />
            )}
            {step === "weight" && (
              <MeasurementStep
                question="What is your weight?"
                value={weightKg}
                unit="kg"
                min={30}
                max={200}
                onChange={setWeightKg}
              />
            )}
            {step === "birthday" && (
              <BirthdayStep value={dob} onChange={setDob} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center pb-4">
        <Button
          variant="glow"
          size="lg"
          className="w-full max-w-sm"
          onClick={handleNext}
          disabled={isPending}
        >
          {isPending ? "Saving…" : isLastStep ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}

function SexStep({
  value,
  onChange,
}: {
  value: "female" | "male" | null;
  onChange: (v: "female" | "male") => void;
}) {
  return (
    <>
      <h1 className="mb-10 text-center text-2xl font-semibold tracking-tight">
        What&apos;s your biological sex?
      </h1>
      <div className="flex items-center justify-center gap-10">
        <SexOption
          selected={value === "female"}
          label="Female"
          onClick={() => onChange("female")}
        />
        <SexOption
          selected={value === "male"}
          label="Male"
          onClick={() => onChange("male")}
        />
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground/70">
        Used only to estimate your age-appropriate recommended sleep range.
      </p>
    </>
  );
}

function SexOption({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-3">
      <motion.div
        animate={{
          scale: selected ? 1.08 : 1,
          opacity: selected ? 1 : 0.45,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`flex h-24 w-24 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-primary bg-primary/15 shadow-glow-sm"
            : "border-white/10 bg-secondary"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-primary" fill="currentColor">
          <circle cx="12" cy="6" r="4" />
          <path d="M12 11c-3 0-5 2-5 5v5h10v-5c0-3-2-5-5-5z" />
        </svg>
      </motion.div>
      <span
        className={`text-sm font-medium ${
          selected ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function MeasurementStep({
  question,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  question: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <>
      <h1 className="mb-10 text-center text-2xl font-semibold tracking-tight">
        {question}
      </h1>
      <div className="mb-8 text-5xl font-semibold tabular-nums text-glow">
        {value} <span className="text-2xl text-muted-foreground">{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full max-w-xs cursor-pointer appearance-none rounded-full bg-secondary accent-indigo-500"
      />
      <div className="mt-2 flex w-full max-w-xs justify-between text-xs text-muted-foreground/70">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </>
  );
}

function BirthdayStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <h1 className="mb-10 text-center text-2xl font-semibold tracking-tight">
        What is your birthday?
      </h1>
      <input
        type="date"
        value={value}
        max={new Date().toISOString().slice(0, 10)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-xs rounded-xl border border-white/10 bg-secondary px-4 py-3 text-center text-lg text-foreground [color-scheme:dark]"
      />
    </>
  );
}
