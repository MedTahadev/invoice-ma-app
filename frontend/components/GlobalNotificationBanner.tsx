
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { BellIcon } from './icons';

const GlobalNotificationBanner: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { globalNotification, currentUser, dismissNotification } = context;

    if (!globalNotification || !globalNotification.isActive || !globalNotification.message) {
        return null;
    }
    
    // Check if the current user has already dismissed this notification
    if (currentUser?.dismissedNotifications.includes(globalNotification.id)) {
        return null;
    }

    const handleDismiss = () => {
        dismissNotification(globalNotification.id);
    };

    return (
        <div className="bg-indigo-600 text-white">
            <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between flex-wrap">
                    <div className="w-0 flex-1 flex items-center">
                        <span className="flex p-2 rounded-lg bg-indigo-800">
                            <BellIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <p className="ml-3 font-medium truncate">
                            <span>{globalNotification.message}</span>
                        </p>
                    </div>
                    <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                        <button
                            type="button"
                            className="-mr-1 flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
                            onClick={handleDismiss}
                        >
                            <span className="sr-only">Dismiss</span>
                             <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalNotificationBanner;
