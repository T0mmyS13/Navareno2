"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";


type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextType {
    showToast: (msg: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [message, setMessage] = useState("");
    const [type, setType] = useState<ToastType>("success");
    const [visible, setVisible] = useState(false);

    const showToast = (msg: string, toastType: ToastType) => {
        setMessage(msg);
        setType(toastType);
        setVisible(true);
        setTimeout(() => setVisible(false), 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {visible && (
                <div className={`toast show ${type}`}>
                    {message}
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
