import React from 'react';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
    return (
        <div className="profile-page">
            <div className="container">
                <h1>Mon Profil</h1>

                <div className="profile-content">
                    <div className="profile-section">
                        <h2>Informations personnelles</h2>
                        <p>Fonctionnalité à venir...</p>
                    </div>

                    <div className="profile-section">
                        <h2>Mes commandes</h2>
                        <p>Historique des commandes à venir...</p>
                    </div>

                    <div className="profile-section">
                        <h2>Mes adresses</h2>
                        <p>Gestion des adresses à venir...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
