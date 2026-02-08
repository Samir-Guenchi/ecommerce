import React, { useEffect } from 'react';
import { InfoIcon, AlertIcon, CheckIcon, CloseIcon } from '../icons/Icons';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onDismiss: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss, duration = 5000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onDismiss, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onDismiss]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onDismiss();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onDismiss]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckIcon size={20} color="var(--color-success)" aria-label="Succès" />;
            case 'error':
                return <AlertIcon size={20} color="var(--color-error)" aria-label="Erreur" />;
            case 'info':
            default:
                return <InfoIcon size={20} color="var(--color-info)" aria-label="Information" />;
        }
    };

    return (
        <div
            className={`toast toast--${type}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <div className="toast__icon">
                {getIcon()}
            </div>
            <div className="toast__content">
                <span className="toast__message">{message}</span>
            </div>
            <button
                onClick={onDismiss}
                aria-label="Fermer la notification"
                className="toast__close"
                type="button"
            >
                <CloseIcon size={16} aria-label="Fermer" />
            </button>
        </div>
    );
};

export default Toast;
