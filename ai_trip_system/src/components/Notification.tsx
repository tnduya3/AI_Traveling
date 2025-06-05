"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from "react-icons/fi";

// Notification Types
export type NotificationType = "success" | "error" | "warning" | "info";

// Single Notification Object Structure
export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number; // in milliseconds
}

// Context Interface
interface NotificationContextProps {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, "id">) => void;
  removeNotification: (id: string) => void;
}

// Create Context
const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});

// Provider Component
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = useCallback(
    (notification: Omit<NotificationItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newNotification = { id, ...notification };
      
      setNotifications((prev) => [...prev, newNotification]);

      // Auto remove notification after duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          removeNotification(id);
        }, notification.duration || 5000); // Default 5 seconds
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Custom Hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

// Helper Functions
export const showSuccess = (message: string, title?: string, duration = 5000) => {
  const { addNotification } = useNotification();
  addNotification({ type: "success", message, title, duration });
};

export const showError = (message: string, title?: string, duration = 5000) => {
  const { addNotification } = useNotification();
  addNotification({ type: "error", message, title, duration });
};

export const showWarning = (message: string, title?: string, duration = 5000) => {
  const { addNotification } = useNotification();
  addNotification({ type: "warning", message, title, duration });
};

export const showInfo = (message: string, title?: string, duration = 5000) => {
  const { addNotification } = useNotification();
  addNotification({ type: "info", message, title, duration });
};

// Notification Icon Component
const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case "success":
      return <FiCheckCircle className="w-6 h-6 text-green-500" />;
    case "error":
      return <FiAlertCircle className="w-6 h-6 text-red-500" />;
    case "warning":
      return <FiAlertTriangle className="w-6 h-6 text-amber-500" />;
    case "info":
      return <FiInfo className="w-6 h-6 text-blue-500" />;
    default:
      return null;
  }
};

// Notification Container Component
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 w-full max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`rounded-lg shadow-lg p-4 flex items-start ${
              notification.type === "success"
                ? "bg-green-50 border-l-4 border-green-500"
                : notification.type === "error"
                ? "bg-red-50 border-l-4 border-red-500"
                : notification.type === "warning"
                ? "bg-amber-50 border-l-4 border-amber-500"
                : "bg-blue-50 border-l-4 border-blue-500"
            }`}
          >
            <div className="flex-shrink-0">
              <NotificationIcon type={notification.type} />
            </div>
            <div className="ml-3 flex-1">
              {notification.title && (
                <h3 className={`text-sm font-medium ${
                  notification.type === "success"
                    ? "text-green-800"
                    : notification.type === "error"
                    ? "text-red-800"
                    : notification.type === "warning"
                    ? "text-amber-800"
                    : "text-blue-800"
                }`}>
                  {notification.title}
                </h3>
              )}
              <div className={`mt-1 text-sm ${
                notification.type === "success"
                  ? "text-green-700"
                  : notification.type === "error"
                  ? "text-red-700"
                  : notification.type === "warning"
                  ? "text-amber-700"
                  : "text-blue-700"
              }`}>
                {notification.message}
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Đóng</span>
              <FiX className="h-5 w-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Single Notification Component (for direct usage)
export const Notification = ({
  type = "info",
  message,
  title,
  onClose,
}: {
  type?: NotificationType;
  message: string;
  title?: string;
  onClose?: () => void;
}) => {
  return (
    <div
      className={`rounded-lg shadow-lg p-4 flex items-start ${
        type === "success"
          ? "bg-green-50 border-l-4 border-green-500"
          : type === "error"
          ? "bg-red-50 border-l-4 border-red-500"
          : type === "warning"
          ? "bg-amber-50 border-l-4 border-amber-500"
          : "bg-blue-50 border-l-4 border-blue-500"
      }`}
    >
      <div className="flex-shrink-0">
        <NotificationIcon type={type} />
      </div>
      <div className="ml-3 flex-1">
        {title && (
          <h3 className={`text-sm font-medium ${
            type === "success"
              ? "text-green-800"
              : type === "error"
              ? "text-red-800"
              : type === "warning"
              ? "text-amber-800"
              : "text-blue-800"
          }`}>
            {title}
          </h3>
        )}
        <div className={`mt-1 text-sm ${
          type === "success"
            ? "text-green-700"
            : type === "error"
            ? "text-red-700"
            : type === "warning"
            ? "text-amber-700"
            : "text-blue-700"
        }`}>
          {message}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <span className="sr-only">Đóng</span>
          <FiX className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};