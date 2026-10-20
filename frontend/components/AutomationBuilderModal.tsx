"use client";
import { useState } from "react";

interface AutomationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (automation: any) => void;
}

interface TriggerOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "event" | "schedule" | "webhook";
}

interface ActionOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "notification" | "api" | "data";
}

export default function AutomationBuilderModal({ isOpen, onClose, onSave }: AutomationBuilderModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [automationName, setAutomationName] = useState("");
  const [automationDescription, setAutomationDescription] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState<string>("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const triggers: TriggerOption[] = [
    {
      id: "user_signup",
      name: "User Signup",
      description: "When a new user creates an account",
      icon: "👤",
      category: "event",
    },
    {
      id: "message_received",
      name: "Message Received",
      description: "When agent receives a new message",
      icon: "💬",
      category: "event",
    },
    {
      id: "task_completed",
      name: "Task Completed",
      description: "When a task is marked as done",
      icon: "✅",
      category: "event",
    },
    {
      id: "schedule_daily",
      name: "Daily Schedule",
      description: "Run at specific time every day",
      icon: "⏰",
      category: "schedule",
    },
    {
      id: "schedule_weekly",
      name: "Weekly Schedule",
      description: "Run on specific day(s) each week",
      icon: "📅",
      category: "schedule",
    },
    {
      id: "webhook_trigger",
      name: "Webhook",
      description: "Triggered by external webhook POST",
      icon: "🔗",
      category: "webhook",
    },
  ];

  const actions: ActionOption[] = [
    {
      id: "send_email",
      name: "Send Email",
      description: "Send email notification",
      icon: "📧",
      category: "notification",
    },
    {
      id: "send_slack",
      name: "Post to Slack",
      description: "Send message to Slack channel",
      icon: "💬",
      category: "notification",
    },
    {
      id: "send_sms",
      name: "Send SMS",
      description: "Send text message via Twilio",
      icon: "📱",
      category: "notification",
    },
    {
      id: "api_call",
      name: "API Request",
      description: "Make HTTP request to external API",
      icon: "🌐",
      category: "api",
    },
    {
      id: "create_task",
      name: "Create Task",
      description: "Add new task to task list",
      icon: "📋",
      category: "data",
    },
    {
      id: "log_data",
      name: "Log Data",
      description: "Write data to database",
      icon: "💾",
      category: "data",
    },
  ];

  const handleSave = () => {
    const automation = {
      name: automationName,
      description: automationDescription,
      trigger: selectedTrigger,
      actions: selectedActions,
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    onSave?.(automation);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setStep(1);
    setAutomationName("");
    setAutomationDescription("");
    setSelectedTrigger("");
    setSelectedActions([]);
  };

  const toggleAction = (actionId: string) => {
    setSelectedActions(prev =>
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Create Automation</h2>
              <p className="text-sm text-slate-600 mt-1">Build automated workflows in 3 steps</p>
            </div>
            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(num => (
              <div key={num} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors ${
                    step >= num
                      ? "bg-[#00D35A] text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {num}
                </div>
                <div
                  className={`flex-1 h-1 ml-2 rounded transition-colors ${
                    step > num ? "bg-[#00D35A]" : "bg-slate-200"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  1️⃣ Basic Information
                </h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Automation Name *
                </label>
                <input
                  type="text"
                  value={automationName}
                  onChange={(e) => setAutomationName(e.target.value)}
                  placeholder="e.g., Welcome New Users"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D35A] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={automationDescription}
                  onChange={(e) => setAutomationDescription(e.target.value)}
                  placeholder="Describe what this automation does..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00D35A] transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Select Trigger */}
          {step === 2 && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  2️⃣ Choose a Trigger
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  What event should start this automation?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {triggers.map(trigger => (
                  <button
                    key={trigger.id}
                    onClick={() => setSelectedTrigger(trigger.id)}
                    className={`p-4 rounded-xl text-left transition-all border-2 ${
                      selectedTrigger === trigger.id
                        ? "border-[#00D35A] bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">{trigger.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {trigger.name}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {trigger.description}
                        </p>
                      </div>
                      {selectedTrigger === trigger.id && (
                        <svg className="w-5 h-5 text-[#00D35A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Actions */}
          {step === 3 && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  3️⃣ Choose Actions
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  What should happen when triggered? (Select multiple)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {actions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => toggleAction(action.id)}
                    className={`p-4 rounded-xl text-left transition-all border-2 ${
                      selectedActions.includes(action.id)
                        ? "border-[#00D35A] bg-emerald-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">{action.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {action.name}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                      {selectedActions.includes(action.id) && (
                        <svg className="w-5 h-5 text-[#00D35A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {selectedActions.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-sm text-emerald-800">
                    ✅ <strong>{selectedActions.length} action(s)</strong> selected
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Navigation Buttons */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => step > 1 && setStep((step - 1) as 1 | 2 | 3)}
              disabled={step === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                step === 1
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-slate-700 hover:bg-slate-200"
              }`}
            >
              ← Back
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              {step < 3 ? (
                <button
                  onClick={() => {
                    if (step === 1 && automationName.trim()) {
                      setStep(2);
                    } else if (step === 2 && selectedTrigger) {
                      setStep(3);
                    }
                  }}
                  disabled={
                    (step === 1 && !automationName.trim()) ||
                    (step === 2 && !selectedTrigger)
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    (step === 1 && !automationName.trim()) ||
                    (step === 2 && !selectedTrigger)
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-[#00D35A] hover:bg-[#00be51] text-white"
                  }`}
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={selectedActions.length === 0}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedActions.length === 0
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-[#00D35A] hover:bg-[#00be51] text-white"
                  }`}
                >
                  ✅ Create Automation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
