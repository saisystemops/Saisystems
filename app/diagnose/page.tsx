"use client";
import { useState } from "react";
import Link from "next/link";
import { HelpCircle, ArrowRight, Play, RefreshCw, CheckCircle, ShieldAlert, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionStep {
  question: string;
  options: { label: string; nextStep: string; diagnosis?: string; severity?: "low" | "medium" | "high" }[];
}

const SYMPTOMS = [
  { id: "power", label: "Won't Turn On / No Power", icon: "🔌" },
  { id: "display", label: "Black Screen / No Display", icon: "🖥️" },
  { id: "performance", label: "Running Extremely Slow", icon: "🐢" },
  { id: "battery", label: "Battery Drain / Charging Issue", icon: "🔋" },
  { id: "heat", label: "Overheating / Loud Fan", icon: "🔥" },
  { id: "liquid", label: "Spilled Liquid / Water Damage", icon: "☕" },
];

const DIAGNOSTIC_FLOW: Record<string, QuestionStep> = {
  power: {
    question: "Does the charging LED indicator light up when plugged in?",
    options: [
      { label: "Yes, but pressing power button does nothing", nextStep: "power_check_static" },
      { label: "No, no lights at all", nextStep: "power_check_charger" },
      { label: "It blinks when I press power", nextStep: "power_blink" },
    ],
  },
  power_check_static: {
    question: "Let's perform a static discharge check. Unplug the charger, hold the power button down for 30 seconds, plug the charger back in, and try. Did it turn on?",
    options: [
      { label: "Yes! It worked", nextStep: "resolved", diagnosis: "The device had a static charge lockup, which was cleared successfully.", severity: "low" },
      { label: "No, still nothing", nextStep: "power_motherboard_fail" },
    ],
  },
  power_check_charger: {
    question: "Do you have another compatible charger to test with, or does this charger work on another device?",
    options: [
      { label: "Yes, tested another charger and still dead", nextStep: "power_dc_jack" },
      { label: "No, cannot test", nextStep: "power_charger_suspect" },
    ],
  },
  power_blink: {
    question: "How many times does the light blink, or does it blink in a pattern (e.g., amber & white)?",
    options: [
      { label: "Repeated blinks / Pattern", nextStep: "hardware_code" },
      { label: "Blinks once and goes off", nextStep: "short_circuit" },
    ],
  },
  display: {
    question: "Do you hear the fan spinning or see power lights turn on when you start the device?",
    options: [
      { label: "Yes, lights are on and fan spins, but screen is black", nextStep: "display_external" },
      { label: "No, no lights or fan at all", nextStep: "power" },
    ],
  },
  display_external: {
    question: "Can you connect the laptop to an external monitor/TV via HDMI? Does it show a picture?",
    options: [
      { label: "Yes, external monitor works fine", nextStep: "display_lcd_fail" },
      { label: "No, external screen is also black", nextStep: "ram_gpu_fail" },
    ],
  },
  performance: {
    question: "Is your device using a traditional Hard Disk Drive (HDD) or a Solid State Drive (SSD)? Check task manager if unsure.",
    options: [
      { label: "It has a traditional HDD", nextStep: "perf_hdd_upgrade" },
      { label: "It already has an SSD", nextStep: "perf_software" },
    ],
  },
  battery: {
    question: "Does the laptop work fine when plugged in but immediately shut down when unplugged?",
    options: [
      { label: "Yes, dies instantly", nextStep: "battery_dead" },
      { label: "No, it charges but drains very quickly (under 1 hour)", nextStep: "battery_wear" },
    ],
  },
  heat: {
    question: "How hot does it get, and does it shut down automatically during use?",
    options: [
      { label: "Gets hot and shuts down automatically", nextStep: "heat_thermal_paste" },
      { label: "Gets hot but stays running, fan is very loud", nextStep: "heat_fan_dust" },
    ],
  },
  liquid: {
    question: "Is the laptop currently turned on?",
    options: [
      { label: "Yes, it is still on", nextStep: "liquid_shut_off" },
      { label: "No, it turned off itself or I shut it down", nextStep: "liquid_treatment" },
    ],
  },
};

// Final Diagnostic Recommendations
const TERMINAL_DIAGNOSES: Record<string, { title: string; diagnosis: string; severity: "low" | "medium" | "high" }> = {
  resolved: {
    title: "Issue Resolved! 🎉",
    diagnosis: "Static discharge cleared the build-up. Your device is running correctly now. No technician required!",
    severity: "low",
  },
  power_motherboard_fail: {
    title: "Motherboard Power Rail Fault",
    diagnosis: "A short circuit or component failure on the motherboard power rail is preventing startup. Requires professional chip-level diagnosis.",
    severity: "high",
  },
  power_dc_jack: {
    title: "Faulty DC Power Jack",
    diagnosis: "The DC power connector port inside your laptop may be physically damaged or loose, preventing charge from reaching the board.",
    severity: "medium",
  },
  power_charger_suspect: {
    title: "Suspected Charger Failure",
    diagnosis: "Your AC adapter/charger might not be outputting power. We recommend testing with a spare adapter or having our team test it.",
    severity: "low",
  },
  hardware_code: {
    title: "Hardware Diagnostic Error Code",
    diagnosis: "The blinking pattern indicates a hardware post failure (often RAM or CPU). Our technicians can diagnose the specific error code sequence.",
    severity: "medium",
  },
  short_circuit: {
    title: "Motherboard Short Circuit",
    diagnosis: "A single blink typically means the power supply detects a short circuit and immediately cuts off power for safety. Needs logic board repair.",
    severity: "high",
  },
  display_lcd_fail: {
    title: "Defective LCD Display Screen",
    diagnosis: "Since the motherboard outputs display to an external monitor, your laptop's screen panel or video cable (EDP cable) is defective and needs replacement.",
    severity: "medium",
  },
  ram_gpu_fail: {
    title: "RAM / GPU / BIOS Fault",
    diagnosis: "The screen and external monitor are black, which suggests the motherboard isn't completing POST. Often caused by dirty RAM contacts or a graphics chip (GPU) failure.",
    severity: "high",
  },
  perf_hdd_upgrade: {
    title: "HDD Bottleneck - SSD Upgrade Recommended",
    diagnosis: "Traditional mechanical hard drives (HDDs) are the #1 cause of slow laptops. Upgrading to a Solid State Drive (SSD) will make your system 5x-10x faster instantly.",
    severity: "low",
  },
  perf_software: {
    title: "Software Bloatware / Virus Infection",
    diagnosis: "Since you already have an SSD, the slowness is likely caused by registry bloat, too many startup programs, corrupted Windows files, or malware.",
    severity: "medium",
  },
  battery_dead: {
    title: "Dead Battery Core",
    diagnosis: "The battery has failed completely and cannot hold charge. The laptop is safe to use on charger, but needs a battery replacement for mobility.",
    severity: "low",
  },
  battery_wear: {
    title: "High Battery Wear Level",
    diagnosis: "Your battery's chemical health has degraded. A standard replacement will restore your laptop's factory backup duration.",
    severity: "low",
  },
  heat_thermal_paste: {
    title: "Thermal Paste Degradation / Clogged Fan",
    diagnosis: "Your laptop is thermal throttling and shutting down to protect the CPU from burning. It needs internal dust cleaning and fresh high-grade thermal paste application.",
    severity: "medium",
  },
  heat_fan_dust: {
    title: "Heatsink Dust Accumulation",
    diagnosis: "Dust is blocking the heatsink fins, forcing the fan to run at max speed. A routine service cleaning will lower temps and noise.",
    severity: "low",
  },
  liquid_shut_off: {
    title: "⚠️ CRITICAL: Turn it Off Immediately!",
    diagnosis: "Keep the laptop on will cause short circuits that permanently burn the motherboard. Power it down immediately, unplug the charger, and DO NOT turn it back on.",
    severity: "high",
  },
  liquid_treatment: {
    title: "Liquid Contamination / Corrosion risk",
    diagnosis: "Even if dry, sticky residue or corrosion will slowly eat the motherboard traces over the next few days. It must be chemically cleaned with isopropyl alcohol by a professional.",
    severity: "high",
  },
};

const severityColors = {
  low: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900",
  medium: "bg-yellow-100 dark:bg-yellow-955 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
  high: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900",
};

export default function DiagnosticWizard() {
  const [symptom, setSymptom] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [diagnosisCode, setDiagnosisCode] = useState<string | null>(null);

  const startDiagnosis = (sym: string) => {
    setSymptom(sym);
    setCurrentStep(sym);
    setDiagnosisCode(null);
  };

  const handleOption = (next: string) => {
    if (TERMINAL_DIAGNOSES[next]) {
      setDiagnosisCode(next);
    } else if (DIAGNOSTIC_FLOW[next]) {
      setCurrentStep(next);
    } else {
      // Fallback
      setDiagnosisCode(next);
    }
  };

  const reset = () => {
    setSymptom(null);
    setCurrentStep(null);
    setDiagnosisCode(null);
  };

  const stepDetails = currentStep ? DIAGNOSTIC_FLOW[currentStep] : null;
  const diagnosis = diagnosisCode ? TERMINAL_DIAGNOSES[diagnosisCode] : null;

  const prefilledProblem = diagnosis 
    ? `Diagnostic Result: ${diagnosis.title}. ${diagnosis.diagnosis}`
    : `Device has troubleshooting issues. Symptom: ${symptom}.`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            🔧 Smart Diagnostics
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">
            Device <span className="text-gradient">Troubleshooter</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Is your laptop dead, slow, or noisy? Go through our step-by-step diagnostic tree to find the issue and next steps.
          </p>
        </div>

        {/* Wizard Box */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 relative min-h-[350px] flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -z-10" />

          <AnimatePresence mode="wait">
            {/* Symptom Selection */}
            {!symptom && (
              <motion.div
                key="symptom-select"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="text-green-600" size={18} />
                  Select the main symptom your device is showing:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SYMPTOMS.map((sym) => (
                    <button
                      key={sym.id}
                      onClick={() => startDiagnosis(sym.id)}
                      className="p-4 bg-gray-50 hover:bg-green-50/50 dark:bg-gray-850/40 dark:hover:bg-green-950/20 border-2 border-gray-100 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-800 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-center cursor-pointer group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">{sym.icon}</span>
                      <span className="font-bold text-xs text-gray-800 dark:text-gray-200">{sym.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Questions Step */}
            {symptom && stepDetails && !diagnosis && (
              <motion.div
                key="question-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">
                    <Cpu size={12} /> Troubleshooter Active
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
                    {stepDetails.question}
                  </h3>
                </div>

                <div className="space-y-3 mt-6">
                  {stepDetails.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleOption(opt.nextStep)}
                      className="w-full p-4 text-left bg-gray-50 hover:bg-green-50 dark:bg-gray-800/50 dark:hover:bg-green-950/20 border-2 border-gray-100 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-800 rounded-xl font-medium text-sm text-gray-800 dark:text-gray-200 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span>{opt.label}</span>
                      <ArrowRight size={16} className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Final Diagnosis */}
            {diagnosis && (
              <motion.div
                key="diagnosis-final"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-4"
              >
                <div className="max-w-md mx-auto">
                  <div className={`inline-block p-4 rounded-full mb-4 ${
                    diagnosis.severity === "high" ? "bg-red-100 dark:bg-red-950/40 text-red-600" :
                    diagnosis.severity === "medium" ? "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600" :
                    "bg-blue-100 dark:bg-blue-950/40 text-blue-600"
                  }`}>
                    {diagnosis.severity === "high" ? <ShieldAlert size={32} /> :
                     diagnosis.severity === "medium" ? <HelpCircle size={32} /> :
                     <CheckCircle size={32} />}
                  </div>

                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border ${severityColors[diagnosis.severity]}`}>
                    {diagnosis.severity} severity
                  </span>

                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{diagnosis.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                    {diagnosis.diagnosis}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {diagnosis.severity !== "low" || diagnosisCode !== "resolved" ? (
                      <Link
                        href={`/book-service?problem=${encodeURIComponent(prefilledProblem)}`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg transition-all"
                      >
                        Book Repair Now <Play size={12} />
                      </Link>
                    ) : null}
                    <button
                      onClick={reset}
                      className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={14} /> Restart Wizard
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {symptom && !diagnosis && (
            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
              <button
                onClick={reset}
                className="text-xs text-gray-500 hover:underline"
              >
                ← Restart Troubleshooter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
