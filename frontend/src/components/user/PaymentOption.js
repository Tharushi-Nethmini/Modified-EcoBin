import React, { useState } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom'; 
import '../styles/PaymentOption.css';
import Header from '../Header';
import Footer from '../Footer';

// Helper function to sanitize strings safely
const sanitize = (str) => {
  if (str === null || str === undefined) return '';
  str = String(str); // Ensure the input is a string
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
};

const PaymentOption = () => {
  const location = useLocation();
  const { amount } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); 

  // Handle payment method change
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setErrorMessage('');
  };

  // Handle card number input (digits only, max 12)
  const handleCardNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,12}$/.test(value)) setCardNumber(value);
  };

  // Handle CVV input (digits only, max 3)
  const handleCvvChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,3}$/.test(value)) setCvv(value);
  };

  // Handle payment submission
  const handleSubmit = async () => {
    setErrorMessage('');

    if (paymentMethod === 'online') {
      if (!cardNumber || cardNumber.length !== 12) {
        setErrorMessage('Card number must be exactly 12 digits.');
        return;
      }
      if (!cvv || cvv.length !== 3) {
        setErrorMessage('CVV must be exactly 3 digits.');
        return;
      }
      if (!expiryDate) {
        setErrorMessage('Expiry date is required.');
        return;
      }
    }

    const paymentData = {
      paymentMethod,
      cardNumber: paymentMethod === 'online' ? cardNumber : null,
      expiryDate: paymentMethod === 'online' ? expiryDate : null,
      cvv: paymentMethod === 'online' ? cvv : null,
      saveCard,
    };

    try {
      const response = await fetch('http://localhost:8070/cardpayment/addcardpayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      alert(sanitize(result.message || 'Payment processed!')); // XSS-safe alert

      const paymentStatus = paymentMethod === 'online' ? 'completed' : 'pending';
      navigate('/status', { state: { paymentMethod, paymentStatus, amount } });

    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Error processing payment. Please try again.'); // Safe alert
    }
  };

  return (
    <>
      <Header />
      <div className="paymentbackground-image">
        <div className="payment-container">
          <h2>Payment Options</h2>
          <h3>Total Payment</h3>
          <h1>Rs. {amount !== undefined ? sanitize(amount) : '0'}.00</h1>

          <div className="payment-methods">
            <div className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
              <label>
                <input
                  type="radio"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={handlePaymentMethodChange}
                />
                <span>Online Payment</span>
              </label>
            </div>

            {paymentMethod === 'online' && (
              <div className="online-payment-options">
                <label>Add Card Details :</label>
                <div className="paymentnew-card-form">
                  <div className="paymentform-grid">
                    <div className="paymentform-column">
                      <input
                        type="text"
                        placeholder="Card Number"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                      />
                      <input
                        type="text"
                        placeholder="Expiry Date (MM/YYYY)"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                      />
                    </div>
                    <div className="paymentform-column">
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cvv}
                        onChange={handleCvvChange}
                      />
                    </div>
                  </div>
                </div>
                {errorMessage && <p className="error-message">{sanitize(errorMessage)}</p>}
              </div>
            )}

            <div className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
              <label>
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={handlePaymentMethodChange}
                />
                <span>Cash</span>
              </label>
            </div>
          </div>

          <div className="paymentbutton-container">
            <button onClick={handleSubmit} className="paymentsubmit-button">OK</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentOption;
