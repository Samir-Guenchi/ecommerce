import React from 'react';
import { useQuery } from '@tantml:react-query';
import { getCart } from '../services/marketplace.api';
import './CartPage.css';

const CartPage: React.FC = () => {
    // TODO: Get userId from auth context
    const userId = 1;

    const { data: cart, isLoading } = useQuery({
        queryKey: ['cart', userId],
        queryFn: () => getCart(userId),
    });

    const calculateTotal = () => {
        // TODO: Calculate from actual product prices
        return 0;
    };

    if (isLoading) {
        return <div className="loading">Chargement du panier...</div>;
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1>Mon Panier</h1>

                {cart && cart.items.length > 0 ? (
                    <div className="cart-content">
                        <div className="cart-items">
                            {cart.items.map((item: any) => (
                                <div key={item.id} className="cart-item">
                                    <img
                                        src={item.productImage || '/placeholder.png'}
                                        alt={item.productName}
                                        className="cart-item-image"
                                    />
                                    <div className="cart-item-details">
                                        <h3>{item.productName}</h3>
                                        <p className="cart-item-price">{item.productPrice} DA</p>
                                    </div>
                                    <div className="cart-item-quantity">
                                        <button className="quantity-btn">-</button>
                                        <span>{item.quantity}</span>
                                        <button className="quantity-btn">+</button>
                                    </div>
                                    <button className="remove-btn">Supprimer</button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h2>Résumé</h2>
                            <div className="summary-row">
                                <span>Sous-total</span>
                                <span>{calculateTotal()} DA</span>
                            </div>
                            <div className="summary-row">
                                <span>Livraison</span>
                                <span>Calculé à l'étape suivante</span>
                            </div>
                            <div className="summary-total">
                                <span>Total</span>
                                <span>{calculateTotal()} DA</span>
                            </div>
                            <button className="checkout-btn">Passer la commande</button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-cart">
                        <p>Votre panier est vide</p>
                        <a href="/search" className="continue-shopping-btn">
                            Continuer vos achats
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
