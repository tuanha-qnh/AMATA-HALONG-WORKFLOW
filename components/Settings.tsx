import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getEmailConfig, saveEmailConfig } from '../services/storageService';
import { EmailConfig } from '../types';
import { Save, Mail } from 'lucide-react';

export const Settings: React.FC = () => {
    const { t } = useLanguage();
    const [config, setConfig] = useState<EmailConfig>({
        smtpHost: '',
        smtpPort: '',
        senderEmail: '',
        senderPassword: '',
        enableNotifications: true
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const stored = getEmailConfig();
        setConfig(stored);
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveEmailConfig(config);
        setMessage(t('settingsSaved'));
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('settings')}</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Mail size={20} /> {t('emailConfig')}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    Configure the SMTP server settings for sending automated task notifications.
                </p>

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('smtpHost')}</label>
                            <input 
                                className="w-full border rounded-md p-2" 
                                placeholder="e.g. smtp.gmail.com"
                                value={config.smtpHost}
                                onChange={e => setConfig({...config, smtpHost: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('smtpPort')}</label>
                            <input 
                                className="w-full border rounded-md p-2" 
                                placeholder="e.g. 587"
                                value={config.smtpPort}
                                onChange={e => setConfig({...config, smtpPort: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                        <input 
                            type="email"
                            className="w-full border rounded-md p-2" 
                            placeholder="admin@company.com"
                            value={config.senderEmail}
                            onChange={e => setConfig({...config, senderEmail: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">App Password</label>
                        <input 
                            type="password"
                            className="w-full border rounded-md p-2" 
                            placeholder="••••••••"
                            value={config.senderPassword}
                            onChange={e => setConfig({...config, senderPassword: e.target.value})}
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input 
                            type="checkbox" 
                            id="enableNotify"
                            checked={config.enableNotifications}
                            onChange={e => setConfig({...config, enableNotifications: e.target.checked})}
                            className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label htmlFor="enableNotify" className="text-sm text-gray-700">Enable Automated Email Notifications</label>
                    </div>

                    {message && <div className="text-green-600 text-sm font-medium bg-green-50 p-2 rounded">{message}</div>}

                    <div className="pt-4 flex gap-4">
                        <button 
                            type="submit" 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                        >
                            <Save size={18} /> {t('saveSettings')}
                        </button>
                        <button 
                            type="button"
                            onClick={() => alert(`Simulating email to ${config.senderEmail}... Success!`)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg border font-medium transition-colors"
                        >
                            Test Connection
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};