"use client";

import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft,
  Send,
  Wrench,
  Building2,
  Home,
  Calendar,
  User,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function MaintenanceDetailPage() {
  // Use useParams() hook instead of params prop
  const params = useParams();
  const requestId = params.id;
  
  const { user } = useUser();
  
  const convexUser = useQuery(
    api.users.getByClerkId,
    user ? { clerkUserId: user.id } : "skip"
  );

  const request = useQuery(
    api.maintenance.getById,
    requestId ? { requestId } : "skip"
  );

  const comments = useQuery(
    api.comments.getByRequest,
    requestId ? { requestId } : "skip"
  );

  const addComment = useMutation(api.comments.addComment);
  const updateStatus = useMutation(api.maintenance.updateStatus);

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  if (!convexUser || !request || !comments) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading request details…</p>
        </div>
      </div>
    );
  }

  const isLandlord = convexUser.isAdmin;
  const viewerType = isLandlord ? "landlord" : "tenant";

  async function sendMessage() {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await addComment({
        requestId,
        authorType: viewerType,
        authorId: convexUser._id,
        message: message.trim(),
      });

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      await updateStatus({ requestId, status: newStatus });
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  }

  const statusConfig = {
    open: {
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-950/30",
      label: "Open"
    },
    in_progress: {
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-950/30",
      label: "In Progress"
    },
    resolved: {
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-950/30",
      label: "Resolved"
    }
  };

  const currentStatus = statusConfig[request.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Navigation */}
      <Link
        href="/dashboard/maintenance"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to All Requests
      </Link>

      {/* Header Card */}
      <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {request.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {request.description}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStatus.bg}`}>
            <StatusIcon className={`w-5 h-5 ${currentStatus.color}`} />
            <span className={`font-semibold ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Property</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {request.property?.name || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Home className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unit</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {request.unit?.unitNumber || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Created</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Status Update Buttons (Landlord Only) */}
        {isLandlord && request.status !== "resolved" && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
            {request.status === "open" && (
              <Button
                onClick={() => handleStatusChange("in_progress")}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
              >
                <Clock className="w-4 h-4 mr-2" />
                Mark In Progress
              </Button>
            )}
            {request.status === "in_progress" && (
              <Button
                onClick={() => handleStatusChange("resolved")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Resolved
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div className="bg-white dark:bg-[#1F1F27] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Communication
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {comments.length} message{comments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Messages Area */}
        <div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-900/20">
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <>
              {comments.map((comment) => {
                const isCurrentUser = comment.authorType === viewerType;
                return (
                  <div
                    key={comment._id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isCurrentUser
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3 h-3" />
                        <span className="text-xs font-semibold opacity-75">
                          {comment.authorType === "landlord" ? "Landlord" : "Tenant"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.message}</p>
                      <span className="text-xs opacity-60 mt-1 block">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#1F1F27]">
          <div className="flex gap-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1 rounded-xl border-slate-300 dark:border-white/10 h-12"
            />
            <Button
              onClick={sendMessage}
              disabled={isSending || !message.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}